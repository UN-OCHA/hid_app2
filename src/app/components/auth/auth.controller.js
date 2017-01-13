(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$scope', '$routeParams', '$location', 'alertService', 'AuthService'];

  function AuthCtrl ($scope, $routeParams, $location, alertService, AuthService) {
    $scope.email = '';

    $scope.login = function() {
      AuthService.login($scope.email, $scope.password).then(function () {
        $scope.initCurrentUser();
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