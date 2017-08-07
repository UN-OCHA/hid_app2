(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$location', '$window', 'alertService', 'AuthService', 'gettextCatalog'];

  function AuthCtrl ($exceptionHandler, $scope, $location, $window, alertService, AuthService, gettextCatalog) {
    $scope.email = '';
    $scope.saving = false;

    function onFirstLogin () {
      $scope.currentUser.setAppMetaData({login: true});
      $scope.currentUser.authOnly = false;
      $scope.currentUser.$update(function () {
        $scope.setCurrentUser($scope.currentUser);
        $location.path('/start');
      });
    }

    $scope.login = function() {
      $scope.saving = true;
      AuthService.login($scope.email, $scope.password).then(function () {
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
        if (error.data && error.data.message === 'Please verify your email address') {
          alertService.add('danger', gettextCatalog.getString('We could not log you in because your email address is not verified yet.'));
          return;
        }
        if (error.data && error.data.message === 'invalid email or password') {
          alertService.add('danger', gettextCatalog.getString('We could not log you in. Please verify your email and password.'));
          return;
        }
        if (error.data && error.data.message === 'Email address could not be found') {
          alertService.add('danger', gettextCatalog.getString('We could not log you in, the email address does not exist.'));
          return;
        }
        if (error.status === 429) {
          alertService.add('danger', gettextCatalog.getString('Your account has been locked for 5 minutes due to too many unsuccessful login attempts'));
          return;
        }
        alertService.add('danger', gettextCatalog.getString('There was an error logging in.'));
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
