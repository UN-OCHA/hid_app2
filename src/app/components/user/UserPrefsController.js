(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserPrefsController', UserPrefsController);

  UserPrefsController.$inject = ['$exceptionHandler', '$scope', '$location', '$timeout', 'AuthService', 'alertService', 'UserDataService', 'gettextCatalog', 'TwoFactorAuthService', 'FileSaver', 'Blob'];

  function UserPrefsController($exceptionHandler, $scope, $location, $timeout, AuthService, alertService, UserDataService, gettextCatalog, TwoFactorAuthService, FileSaver, Blob) {
    var thisScope = $scope;

    thisScope.pendingConnections = [];
    thisScope.approvedConnections = [];
    thisScope.password = {
      old: '',
      new: ''
    };

    thisScope.timezones = moment.tz.names();
    thisScope.twoFactorAuthStep = 1;
    thisScope.showMore = false;

    UserDataService.getUserFromServer(thisScope.currentUser.id)
    .then(function (user) {
      thisScope.user = user;
      thisScope.trustedDevices = parseTrustedDevices(thisScope.user.totpTrusted);
      getConnections(thisScope.user);
    });

    function updateUserPassword (form, token) {
      thisScope.user.changePassword(thisScope.user, function () {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
        form.$setPristine();
      }, function (error) {
        $exceptionHandler(error, 'savePassword');
        form.$setPristine();
      }, token);
    }

    // Set a new password for the current user
    thisScope.savePassword = function(form) {
      thisScope.user.old_password = thisScope.password.old;
      thisScope.user.new_password = thisScope.password.new;

      if (thisScope.user.totp) {
        TwoFactorAuthService.requestToken(function (token) {
          updateUserPassword(form, token);
        }, function () {
          form.$setPristine();
        });
        return;
      }

      updateUserPassword(form);
    };

    // Set settings for the current user
    thisScope.saveSettings = function () {
      thisScope.user.$update(function () {
        alertService.add('success', gettextCatalog.getString('Your settings were successfully changed.'));
        thisScope.setCurrentUser(thisScope.user);
        thisScope.initLanguage();
      }, function (error) {
        $exceptionHandler(error, 'saveSettings');
      });
    };

    // Delete current user account
    thisScope.deleteAccount = function () {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will not be able to access Humanitarian ID anymore.'), true, function() {
        thisScope.user.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Your account was successfully removed. You are now logged out. Sorry to have you go.'), false, function () {});
          AuthService.logout();
          thisScope.removeCurrentUser();
          $location.path('/');
        });
      });
    };

    // Revoke client
    thisScope.revokeClient = function (client) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? You will need to authorize this application again to access it through Humanitarian ID.'), true, function () {
        var index = -1;
        for (var i = 0, len = thisScope.user.authorizedClients.length; i < len; i++) {
          if (thisScope.user.authorizedClients[i].id == client.id) {
            index = i;
          }
        }
        if (index != -1) {
          thisScope.user.authorizedClients.splice(index, 1);
          thisScope.user.$update(function () {
            alertService.add('success', gettextCatalog.getString('Application successfully revoked.'));
          }, function (error) {
            $exceptionHandler(error, 'revokeClient');
          });
        }
      });
    };

    function getConnections (user) {
      thisScope.pendingConnections = user.connections.filter(function(connection) {
        return connection.pending;
      });

      thisScope.approvedConnections = user.connections.filter(function(connection) {
        return !connection.pending;
      });
    }

    thisScope.approveConnection = function (connection) {
      thisScope.user.approveConnection(thisScope.user._id, connection._id, function () {
        alertService.add('success', 'Connection approved', false, function () {});
        var index = thisScope.user.connections.indexOf(connection);
        thisScope.user.connections[index].pending = false;
        getConnections(thisScope.user);
        thisScope.setCurrentUser(thisScope.user);
      }, function (error) {
        $exceptionHandler(error, 'approveConnection');
      });
    };

    thisScope.removeConnection = function (connection) {
      thisScope.user.deleteConnection(thisScope.user._id, connection._id, function () {
        alertService.add('success', gettextCatalog.getString('Connection removed'), false, function () {});
        thisScope.user.connections.splice(thisScope.user.connections.indexOf(connection), 1);
        getConnections(thisScope.user);
        thisScope.setCurrentUser(thisScope.user);
      }, function (error) {
        $exceptionHandler(error, 'removeConnection');
      });
    };

    thisScope.tokens = [];
    AuthService.getUserTokens(function (tokens) {
      angular.forEach(tokens, function (token) {
        if (!token.blacklist) {
          thisScope.tokens.push(token);
        }
      });
    });

    thisScope.newToken = function () {
      AuthService.generateAPIToken(function (token) {
        token.new = true;
        thisScope.tokens.unshift(token);
      });
    };

    thisScope.deleteToken = function (token) {
      AuthService.deleteToken(token.token, function () {
        alertService.add('success', gettextCatalog.getString('API key deleted'), false, function () {});
        thisScope.tokens.splice(thisScope.tokens.indexOf(token), 1);
      });
    };

    // Two Factor Auth
    thisScope.getQRCode = function () {
      TwoFactorAuthService.generateQRCode(function (response) {
        thisScope.qrCode = response.data.url;
        thisScope.twoFactorAuthStep = 2;
      }, function (error) {
        $exceptionHandler(error, 'getQRCode');
      });
    };

    thisScope.getRecoveryCodes = function () {
      TwoFactorAuthService.generateRecoveryCodes(function (response) {
        thisScope.recoveryCodes = response.data;
      }, function (error) {
        $exceptionHandler(error, 'getRecoveryCodes');
      });
    };

    thisScope.downloadRecoveryCodes = function () {
      var codes = [];
      angular.forEach(thisScope.recoveryCodes, function (code) {
        codes.push(code + '\r\n');
      });
      var data = new Blob(codes, { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'hid-recovery-codes.txt');
    };

    thisScope.enableTFA = function (token) {
      TwoFactorAuthService.enable(token, function (response) {
        thisScope.twoFactorAuthStep = 3;
        thisScope.setCurrentUser(response.data);
        thisScope.getRecoveryCodes();
      }, function (error) {
        $exceptionHandler(error, 'enableTFA');
      });
    };

    function disableTFA (token) {
      TwoFactorAuthService.disable(token, function (response) {
        thisScope.setCurrentUser(response.data);
        thisScope.user.totp = false;
        thisScope.recoveryCodes = [];
      }, function (error) {
        $exceptionHandler(error, 'disableTFA');
      });
    }

    thisScope.disableTwoFactorAuth = function () {
      TwoFactorAuthService.requestToken(function (token) {
        disableTFA(token);
      });
    };

    thisScope.resetTFAForm = function () {
      thisScope.user.totp = true;
      thisScope.twoFactorAuthStep = 1;
      thisScope.recoveryCodes = [];
    };

    thisScope.deleteTrustedDevice = function (id) {
      TwoFactorAuthService.deleteTrustedDevice(id, function () {
        alertService.add('success', gettextCatalog.getString('Device removed.'));
        var index = thisScope.trustedDevices.map(function(x){ return x._id; }).indexOf(id);
        thisScope.trustedDevices.splice(index,1);
      }, function (error) {
         $exceptionHandler(error, 'delete Trusted Device');
      });
    };

    function parseTrustedDevices (devices) {
      var parsedDevices = [];
      angular.forEach(devices, function (device) {
        if (UAParser) {
          var ua = new UAParser(device.ua);
          var deviceString = ua.getBrowser().name + ' on ' + ua.getOS().name;
          if (ua.getDevice().model !== undefined) {
            deviceString += ', ' + ua.getDevice().model;
          }
          parsedDevices.push({name: deviceString, _id: device._id});
        } else {
          parsedDevices.push(device.ua);
        }
      });
      return parsedDevices;
    }

  }

})();
