(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$location', '$timeout', '$window', 'alertService', 'AuthService', 'gettextCatalog', 'TwoFactorAuthService'];

  function AuthCtrl ($exceptionHandler, $scope, $location, $timeout, $window, alertService, AuthService, gettextCatalog, TwoFactorAuthService) {
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
        var redirectUri = $location.search();
        if (redirectUri.redirect === '') {
          $location.path('/landing');
        }
        else {
          $location.path(redirectUri.redirect);
        }
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
          TwoFactorAuthService.trustDevice(tfaCode, function () {
            successfullLogin();
          }, function (error) {
            $exceptionHandler(error, 'Trust device fail');
            successfullLogin();
          });
          return;
        }

        // 2FA required
        if (response && response.data.statusCode === 401 && response.data.message === 'No TOTP token') {
          TwoFactorAuthService.requestToken(function (token, trustDevice) {
            $scope.login(token, trustDevice);
          }, function () {
            $scope.saving = false;
          }, true);
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
      var redirectUri = $location.search();
      if (redirectUri.redirect === '') {
        $location.path('/landing');
      }
      else {
        $location.path(redirectUri.redirect);
      }
    }
  }
})();
