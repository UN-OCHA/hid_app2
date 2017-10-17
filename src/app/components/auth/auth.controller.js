(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$location', '$uibModal', '$window', 'alertService', 'AuthService', 'gettextCatalog'];

  function AuthCtrl ($exceptionHandler, $scope, $location, $uibModal, $window, alertService, AuthService, gettextCatalog) {
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

    $scope.login = function(tfaCode) {
      console.log('login tfaCode', tfaCode)
      if (twoFAModal) {
        twoFAModal.close();
      }
      $scope.saving = true;
      AuthService.login($scope.email, $scope.password, tfaCode).then(function (response) {
        console.log('auth controller login', response);
        // 2FA required
        if (response && response.data.statusCode === 401 && response.data.message === 'No TOTP token') {
          console.log('open modal')

          twoFAModal = $uibModal.open({
            scope: $scope,
            size: 'sm',
            templateUrl: 'app/components/user/twoFactorAuthLoginModal.html',
          })

          twoFAModal.result.then(function () {
            return;
          }, function () {
            $scope.saving = false;
            return;
          });

          return;
        }


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
