(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserPrefsController', UserPrefsController);

  UserPrefsController.$inject = ['$exceptionHandler', '$scope', '$location', '$timeout', 'AuthService', 'alertService', 'UserDataService', 'gettextCatalog', 'TwoFactorAuthService', 'FileSaver', 'Blob'];

  function UserPrefsController($exceptionHandler, $scope, $location, $timeout, AuthService, alertService, UserDataService, gettextCatalog, TwoFactorAuthService, FileSaver, Blob) {
    $scope.pendingConnections = [];
    $scope.approvedConnections = [];
    $scope.password = {
      old: '',
      new: ''
    };

    $scope.timezones = moment.tz.names();
    $scope.twoFactorAuthStep = 1;
    $scope.showMore = false;

    UserDataService.getUserFromServer($scope.currentUser.id)
    .then(function (user) {
      $scope.user = user;
      $scope.trustedDevices = parseTrustedDevices($scope.user.totpTrusted);
      getConnections($scope.user);
    });

    function updateUserPassword (form, token) {
      $scope.user.changePassword($scope.user, function () {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
        form.$setPristine();
      }, function (error) {
        $exceptionHandler(error, 'savePassword');
        form.$setPristine();
      }, token);
    }

    // Set a new password for the current user
    $scope.savePassword = function(form) {
      $scope.user.old_password = $scope.password.old;
      $scope.user.new_password = $scope.password.new;

      if ($scope.user.totp) {
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
    $scope.saveSettings = function () {
      $scope.user.$update(function () {
        alertService.add('success', gettextCatalog.getString('Your settings were successfully changed.'));
        $scope.setCurrentUser($scope.user);
        $scope.initLanguage();
      }, function (error) {
        $exceptionHandler(error, 'saveSettings');
      });
    };

    // Delete current user account
    $scope.deleteAccount = function () {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will not be able to access Humanitarian ID anymore.'), true, function() {
        $scope.user.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Your account was successfully removed. You are now logged out. Sorry to have you go.'), false, function () {});
          AuthService.logout();
          $scope.removeCurrentUser();
          $location.path('/');
        });
      });
    };

    // Revoke client
    $scope.revokeClient = function (client) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? You will need to authorize this application again to access it through Humanitarian ID.'), true, function () {
        var index = -1;
        for (var i = 0, len = $scope.user.authorizedClients.length; i < len; i++) {
          if ($scope.user.authorizedClients[i].id == client.id) {
            index = i;
          }
        }
        if (index != -1) {
          $scope.user.authorizedClients.splice(index, 1);
          $scope.user.$update(function () {
            alertService.add('success', gettextCatalog.getString('Application successfully revoked.'));
          }, function (error) {
            $exceptionHandler(error, 'revokeClient');
          });
        }
      });
    };

    function getConnections (user) {
      $scope.pendingConnections = user.connections.filter(function(connection) {
        return connection.pending;
      });

      $scope.approvedConnections = user.connections.filter(function(connection) {
        return !connection.pending;
      });
    }

    $scope.approveConnection = function (connection) {
      $scope.user.approveConnection($scope.user._id, connection._id, function () {
        alertService.add('success', 'Connection approved', false, function () {});
        var index = $scope.user.connections.indexOf(connection);
        $scope.user.connections[index].pending = false;
        getConnections($scope.user);
        $scope.setCurrentUser($scope.user);
      }, function (error) {
        $exceptionHandler(error, 'approveConnection');
      });
    };

    $scope.removeConnection = function (connection) {
      $scope.user.deleteConnection($scope.user._id, connection._id, function () {
        alertService.add('success', gettextCatalog.getString('Connection removed'), false, function () {});
        $scope.user.connections.splice($scope.user.connections.indexOf(connection), 1);
        getConnections($scope.user);
        $scope.setCurrentUser($scope.user);
      }, function (error) {
        $exceptionHandler(error, 'removeConnection');
      });
    };

    $scope.tokens = [];
    AuthService.getUserTokens(function (tokens) {
      angular.forEach(tokens, function (token) {
        if (!token.blacklist) {
          $scope.tokens.push(token);
        }
      });
    });

    $scope.newToken = function () {
      AuthService.generateAPIToken(function (token) {
        token.new = true;
        $scope.tokens.unshift(token);
      });
    };

    $scope.deleteToken = function (token) {
      AuthService.deleteToken(token.token, function () {
        alertService.add('success', gettextCatalog.getString('API key deleted'), false, function () {});
        $scope.tokens.splice($scope.tokens.indexOf(token), 1);
      });
    };

    // Two Factor Auth
    $scope.getQRCode = function () {
      TwoFactorAuthService.generateQRCode(function (response) {
        $scope.qrCode = response.data.url;
        $scope.twoFactorAuthStep = 2;
      }, function (error) {
        $exceptionHandler(error, 'getQRCode');
      });
    };

    $scope.getRecoveryCodes = function () {
      TwoFactorAuthService.generateRecoveryCodes(function (response) {
        $scope.recoveryCodes = response.data;
      }, function (error) {
        $exceptionHandler(error, 'getRecoveryCodes');
      });
    };

    $scope.downloadRecoveryCodes = function () {
      var codes = [];
      angular.forEach($scope.recoveryCodes, function (code) {
        codes.push(code + '\r\n');
      });
      var data = new Blob(codes, { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'hid-recovery-codes.txt');
    };

    $scope.enableTFA = function (token) {
      TwoFactorAuthService.enable(token, function (response) {
        $scope.twoFactorAuthStep = 3;
        $scope.setCurrentUser(response.data);
        $scope.getRecoveryCodes();
      }, function (error) {
        $exceptionHandler(error, 'enableTFA');
      });
    };

    function disableTFA (token) {
      TwoFactorAuthService.disable(token, function (response) {
        $scope.setCurrentUser(response.data);
        $scope.user.totp = false;
        $scope.recoveryCodes = [];
      }, function (error) {
        $exceptionHandler(error, 'disableTFA');
      });
    }

    $scope.disableTwoFactorAuth = function () {
      TwoFactorAuthService.requestToken(function (token) {
        disableTFA(token);
      });
    };

    $scope.resetTFAForm = function () {
      $scope.user.totp = true;
      $scope.twoFactorAuthStep = 1;
      $scope.recoveryCodes = [];
    };

    $scope.deleteTrustedDevice = function (id) {
      TwoFactorAuthService.deleteTrustedDevice(id, function () {
        alertService.add('success', gettextCatalog.getString('Device removed.'));
        var index = $scope.trustedDevices.map(function(x){ return x._id; }).indexOf(id);
        $scope.trustedDevices.splice(index,1);
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
