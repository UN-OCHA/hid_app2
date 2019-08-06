(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('ResetPasswordController', ResetPasswordController);

  ResetPasswordController.$inject = ['$scope', '$routeParams', '$location', 'alertService', 'TwoFactorAuthService', 'User', 'gettextCatalog'];

  function ResetPasswordController ($scope, $routeParams, $location, alertService, TwoFactorAuthService, User, gettextCatalog) {
    $scope.isOrphan = $routeParams.orphan;
    $scope.resetPassword = resetPassword;
    $scope.requestPasswordReset = requestPasswordReset;

    function requestPasswordReset () {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      User.passwordReset($scope.email, function (response) {
        alertService.add('success', gettextCatalog.getString('Password reset was sent to ' + $scope.email + '. Please make sure the email address is correct. If not, please reset your password again'));
        $scope.reset.$setPristine();
      }, function (error) {
        var msg = gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.');
        alertService.add('danger', msg);
        $scope.reset.$setPristine();
      });
    }

    function resetPassword (token) {
      User.resetPassword($location.search().hash, $location.search().id, $location.search().time, $scope.newPassword, function (response) {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed. You can now login.'));
        $location.path('/');
      }, function (error) {
        if (error && error.status === 401 && error.data.message === "No TOTP token") {
          TwoFactorAuthService.requestToken(function(token) {
            resetPassword(token);
          }, function () {
            $scope.resetPasswordForm.$setPristine();
          });
          return;
        }
        alertService.add('danger', gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.'));
        $scope.resetPasswordForm.$setPristine();
      }, token);
    }

  }
})();
