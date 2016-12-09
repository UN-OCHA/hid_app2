(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthCtrl', AuthCtrl);

  AuthCtrl.$inject = ['$scope', '$routeParams', '$location', '$http', 'gettextCatalog', 'alertService', 'AuthService', 'User'];

  function AuthCtrl ($scope, $routeParams, $location, $http, gettextCatalog, alertService, AuthService, User) {
    $scope.email = '';
    $scope.login = function() {
      AuthService.login($scope.email, $scope.password).then(function () {
        $scope.initCurrentUser();
        $location.path('/landing');
      }, function (data) {
        if (data.message == 'Please verify your email address') {
          alertService.add('danger', gettextCatalog.getString('We could not log you in because your email address is not verified yet.'));
        }
        else {
          alertService.add('danger', gettextCatalog.getString('We could not log you in. Please verify your email and password.'));
        }
      });
    };

    $scope.logout = function() {
      AuthService.logout();
      $scope.removeCurrentUser();
      $location.path('/');
      alertService.add('success', gettextCatalog.getString('You were successfully logged out.'));
    };

    $scope.passwordReset = function() {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      User.passwordReset($scope.email, function (response) {
        alertService.add('success', gettextCatalog.getString('You will soon receive an email which will allow you to reset your password.'));
        $scope.reset.$setPristine();
      }, function (response) {
        alertService.add('danger', gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.'));
        $scope.reset.$setPristine();
      });
    };

    $scope.resetPasswordFunction = function() {
      User.resetPassword($location.search().hash, $scope.newPassword, function (response) {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed. You can now login.'));
        $location.path('/');
      }, function (response) {
        alertService.add('danger', gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.'));
        $scope.resetPassword.$setPristine();
      });
    };

    if ($location.path() == '/logout') {
      $scope.logout();
    }
    else if ($location.path() == '/' && $scope.currentUser) {
      $location.path('/landing');
    }
  }
})();