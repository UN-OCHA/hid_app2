(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$location', 'alertService', 'AuthService'];

  function AuthCtrl ($exceptionHandler, $scope, $location, alertService, AuthService) {
    $scope.email = '';
    $scope.saving = false;

    $scope.login = function() {
      $scope.saving = true;
      AuthService.login($scope.email, $scope.password).then(function () {
        $scope.initCurrentUser();
        $scope.saving = false;

        if ($scope.currentUser.appMetadata && $scope.currentUser.appMetadata.hid) {

          // New user first login
          if (!$scope.currentUser.appMetadata.hid.login) {
            $scope.currentUser.setAppMetaData({login: true});
            $scope.currentUser.$update(function () {
              $scope.setCurrentUser($scope.currentUser);
              $location.path('/start');
            });
            return;
          }

          //HIDv1 user first login (login is already set to true)
          if ($scope.currentUser.appMetadata.hid.login && !$scope.currentUser.appMetadata.hid.viewedTutorial) {
            $location.path('/tutorial');
            return;
          }

          $location.path('/landing');
          return;
        }

        $location.path('/landing');

      }, function (error) {
        $scope.saving = false;
        if (error.data.message === 'Please verify your email address') {
          alertService.add('danger', 'We could not log you in because your email address is not verified yet.');
          return;
        }
        if (error.data.message === 'invalid email or password') {
          alertService.add('danger', 'We could not log you in. Please verify your email and password.');
          return;
        }
        alertService.add('danger', 'There was an error logging in.');
        $exceptionHandler(error, 'Log in fail');
      });
    };

    $scope.logout = function() {
      AuthService.logout();
      $scope.removeCurrentUser();
      $location.path('/');
      alertService.add('success', 'You were successfully logged out.');
    };

    if ($location.path() == '/logout') {
      $scope.logout();
    }
    else if ($location.path() == '/' && $scope.currentUser) {
      $location.path('/landing');
    }
  }
})();
