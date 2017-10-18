(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserPrefsCtrl', UserPrefsCtrl);

  UserPrefsCtrl.$inject = ['$exceptionHandler', '$scope', '$location', '$timeout', '$uibModal', 'AuthService', 'alertService', 'UserDataService', 'gettextCatalog', 'TwoFactorAuth', 'FileSaver', 'Blob'];

  function UserPrefsCtrl($exceptionHandler, $scope, $location, $timeout, $uibModal, AuthService, alertService, UserDataService, gettextCatalog, TwoFactorAuth, FileSaver, Blob) {
    $scope.pendingConnections = [];
    $scope.approvedConnections = [];
    $scope.password = {
      old: '',
      new: ''
    };

    $scope.timezones = moment.tz.names();
    $scope.twoFactorAuthStep = 1;

    UserDataService.getUser($scope.currentUser.id, function () {
      $scope.user = UserDataService.user;
      $scope.trustedDevices = parseTrustedDevices($scope.user.totpTrusted);
      getConnections($scope.user);
    });

    // Set a new password for the current user
    $scope.savePassword = function(form) {
      $scope.user.old_password = $scope.password.old;
      $scope.user.new_password = $scope.password.new;
      $scope.user.$update(function () {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
        form.$setPristine();
      }, function (error) {
        $exceptionHandler(error, 'savePassword');
        form.$setPristine();
      });
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
      TwoFactorAuth.generateQRCode(function (response) {
        $scope.qrCode = response.data.url;
        $scope.twoFactorAuthStep = 2;
      }, function (error) {
        $exceptionHandler(error, 'getQRCode');
      });
    };

    $scope.getRecoveryCodes = function () {
      TwoFactorAuth.generateRecoveryCodes(function (response) {
        $scope.recoveryCodes = response.data;
      }, function (error) {
        $exceptionHandler(error, 'getRecoveryCodes');
      });
    };

    $scope.downloadRecoveryCodes = function () {
      var codes = [];
      angular.forEach($scope.recoveryCodes, function (code) {
        codes.push(code + '\n');
      });
      var data = new Blob(codes, { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'hid-recovery-codes.txt');
    };

    $scope.enableTFA = function (code) {
      TwoFactorAuth.enable(code, function (response) {
        $scope.twoFactorAuthStep = 3;
        $scope.setCurrentUser(response.data);
        $scope.getRecoveryCodes();
      }, function (error) {
        $exceptionHandler(error, 'enableTFA');
      });
    };

    function disableTFA (token) {
      TwoFactorAuth.disable(token, function (response) {
        $scope.setCurrentUser(response.data);
        $scope.user.totp = false;
        $scope.recoveryCodes = [];
        twoFAModal.close();
      }, function (error) {
        $exceptionHandler(error, 'disableTFA');
      });
    }

    var twoFAModal;
    $scope.openTFAModal = function () {
      twoFAModal = $uibModal.open({
        controller: function ($scope) {
          $scope.close = function () {
            twoFAModal.close($scope.token);
          };
          $scope.dismiss = function () {
            twoFAModal.dismiss();
          };
        },
        size: 'sm',
        templateUrl: 'app/components/user/twoFactorAuthModal.html',
      });

      twoFAModal.opened.then(function () {
        $timeout(function () {
          document.getElementById('code').focus();
        }, 0);
      });

      twoFAModal.result.then(function (token) {
        disableTFA(token);
        return;
      }, function () {
        return;
      });
    };

    $scope.resetTFAForm = function () {
      $scope.user.totp = true;
      $scope.twoFactorAuthStep = 1;
      $scope.recoveryCodes = [];
    };

    $scope.deleteTrustedDevice = function () {
      TwoFactorAuth.deleteTrustedDevice();
    };

    function parseTrustedDevices (devices) {
      var parsedDevices = [];
      angular.forEach(devices, function (device) {
        if (UAParser) {
          var ua = new UAParser(device.ua);
          var deviceString = ua.getBrowser().name + ' on ' + ua.getOS().name;
          if (ua.getDevice()) {
            deviceString += ', ' + ua.getDevice().model;
          }
          parsedDevices.push(deviceString);
        } else {
          parsedDevices.push(device.ua);
        }
      });
      return parsedDevices;
    }

  }

})();
