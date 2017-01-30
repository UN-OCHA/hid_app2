(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$scope', '$routeParams', '$location', 'alertService', 'AuthService', 'User'];

  function AuthCtrl ($scope, $routeParams, $location, alertService, AuthService, User) {
    $scope.email = '';

    $scope.login = function() {
      AuthService.login($scope.email, $scope.password).then(function () {
        $scope.initCurrentUser();
        var user = new User($scope.currentUser);
        
        if (!$scope.currentUser.appMetadata || ($scope.currentUser.appMetadata && !$scope.currentUser.appMetadata.hid)) {
          user.setAppMetaData({hasLoggedIn: true});
          user.$update(function () {
            $scope.setCurrentUser(user);
            $location.path('/tutorial');
          });
          return;
        }

        if (!$scope.currentUser.appMetadata.hid.hasLoggedIn) {
          user.setAppMetaData({hasLoggedIn: true});
          user.$update(function () {
            $scope.setCurrentUser(user);
            $location.path('/start');
          });
          return;
        }

        if (!$scope.currentUser.appMetadata.hid.viewedTutorial) {
          $location.path('/tutorial');
          return;
        }
        $location.path('/landing');

      }, function (data) {
        if (data.message == 'Please verify your email address') {
          alertService.add('danger', 'We could not log you in because your email address is not verified yet.');
        }
        else {
          alertService.add('danger', 'We could not log you in. Please verify your email and password.');
        }
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