(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('ResetPasswordCtrl', ResetPasswordCtrl);

  ResetPasswordCtrl.$inject = ['$scope', '$routeParams', '$location', 'alertService', 'User'];

  function ResetPasswordCtrl ($scope, $routeParams, $location, alertService, User) {
    $scope.isOrphan = $routeParams.orphan;
    $scope.resetPassword = resetPassword;
    $scope.requestPasswordReset = requestPasswordReset;

    function requestPasswordReset () {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      User.passwordReset($scope.email, function (response) {
        alertService.add('success', 'You will soon receive an email which will allow you to reset your password.');
        $scope.reset.$setPristine();
      }, function (response) {
        alertService.add('danger', 'There was an error resetting your password. Please try again or contact the HID team.');
        $scope.reset.$setPristine();
      });
    }

    function resetPassword () {
      User.resetPassword($location.search().hash, $scope.newPassword, function (response) {
        alertService.add('success', 'Your password was successfully changed. You can now login.');
        $location.path('/');
      }, function (response) {
        alertService.add('danger', 'There was an error resetting your password. Please try again or contact the HID team.');
        $scope.resetPasswordForm.$setPristine();
      });
    }
    
  }
})();
