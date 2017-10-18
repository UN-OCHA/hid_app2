(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$location', '$timeout', '$uibModal', '$window', 'alertService', 'AuthService', 'gettextCatalog', 'TwoFactorAuth'];

  function AuthCtrl ($exceptionHandler, $scope, $location, $timeout, $uibModal, $window, alertService, AuthService, gettextCatalog, TwoFactorAuth) {
    $scope.email = '';
    $scope.saving = false;
    var twoFAModal;

    function onFirstLogin () {
      $scope.currentUser.setAppMetaData({login: true});
      $scope.currentUser.authOnly = false;
      $scope.currentUser.$update(function () {
        $scope.setCurrentUser($scope.currentUser);
        $location.path('/start');
      });
    }

    function doTwoFactorAuth () {
      twoFAModal = $uibModal.open({
        controller: function ($scope) {
          $scope.tfa = {
            token: '',
            trustDevice: false
          }
          $scope.close = function () {
            twoFAModal.close($scope.tfa);
          };
          $scope.dismiss = function () {
            twoFAModal.dismiss();
          }
        },
        size: 'sm',
        templateUrl: 'app/components/user/twoFactorAuthLoginModal.html',
      });

      twoFAModal.opened.then(function () {
        $timeout(function () {
          document.getElementById('code').focus();
        }, 0);
      });

      twoFAModal.result.then(function (tfa) {
        $scope.login(tfa.token, tfa.trustDevice);
        return;
      }, function () {
        return;
      });
    }

    function successfullLogin () {
      $scope.initCurrentUser();
      $scope.saving = false;
      $window.localStorage.setItem('hidResetPassword', true);

      if ($scope.currentUser.appMetadata && $scope.currentUser.appMetadata.hid) {

        // New user first login (login is set to false in registration)
        if (!$scope.currentUser.appMetadata.hid.login) {
          onFirstLogin();
          return;
        }

        //HIDv1 user first login (login is already set to true)
        if ($scope.currentUser.appMetadata.hid.login && !$scope.currentUser.appMetadata.hid.viewedTutorial) {
          $location.path('/tutorial');
          return;
        }

        // User has logged in previously
        $location.path('/landing');
        return;
      }

      // Users registering via auth dont have metadata set until first login
      onFirstLogin();
    }

    $scope.login = function(tfaCode, trustDevice) {
      if (twoFAModal) {
        twoFAModal.close();
      }
      $scope.saving = true;
      AuthService.login($scope.email, $scope.password, tfaCode).then(function (response) {


        if (trustDevice) {
          TwoFactorAuth.trustDevice(tfaCode, function () {
            successfullLogin();
          }, function () {
            $exceptionHandler(error, 'Trust device fail');
            successfullLogin();
          })
          return;
        }

        // 2FA required
        if (response && response.data.statusCode === 401 && response.data.message === 'No TOTP token') {
          doTwoFactorAuth();
          return;
        }

        successfullLogin();

      }, function (error) {
        $scope.saving = false;
        $exceptionHandler(error, 'Log in fail');
      });
    };

    $scope.logout = function() {
      AuthService.logout();
      $scope.removeCurrentUser();
      $location.path('/');
      alertService.add('success', gettextCatalog.getString('You were successfully logged out.'));
    };

    if ($location.path() == '/logout') {
      $scope.logout();
    }
    else if ($location.path() == '/' && $scope.currentUser) {
      $location.path('/landing');
    }
  }
})();
