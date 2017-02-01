(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'alertService', 'AuthService', 'User'];

  function AuthCtrl ($exceptionHandler, $scope, $routeParams, $location, alertService, AuthService, User) {
    $scope.email = '';

    $scope.login = function() {
      AuthService.login($scope.email, $scope.password).then(function () {
        $scope.initCurrentUser();

        if (!$scope.currentUser.appMetadata || ($scope.currentUser.appMetadata && !$scope.currentUser.appMetadata.hid)) {
          $scope.currentUser.setAppMetaData({hasLoggedIn: true});
          $scope.currentUser.$update(function () {
            $scope.setCurrentUser($scope.currentUser);
            $location.path('/tutorial');
          });
          return;
        }

        if (!$scope.currentUser.appMetadata.hid.hasLoggedIn) {
          $scope.currentUser.setAppMetaData({hasLoggedIn: true});
          $scope.currentUser.$update(function () {
            $scope.setCurrentUser($scope.currentUser);
            $location.path('/start');
          });
          return;
        }

        if (!$scope.currentUser.appMetadata.hid.viewedTutorial) {
          $location.path('/tutorial');
          return;
        }
        $location.path('/landing');

      }, function (error) {
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