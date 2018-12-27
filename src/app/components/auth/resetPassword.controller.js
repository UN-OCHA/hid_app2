(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('ResetPasswordCtrl', ResetPasswordCtrl);

  ResetPasswordCtrl.$inject = ['$scope', '$routeParams', '$location', 'alertService', 'TwoFactorAuthService', 'User', 'gettextCatalog'];

  function ResetPasswordCtrl ($scope, $routeParams, $location, alertService, TwoFactorAuthService, User, gettextCatalog) {
    $scope.isOrphan = $routeParams.orphan;
    $scope.resetPassword = resetPassword;
    $scope.requestPasswordReset = requestPasswordReset;

    function requestPasswordReset () {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      User.passwordReset($scope.email, function (response) {
        alertService.add('success', gettextCatalog.getString('Your password reset instructions have been sent. Please check your email. If you do not receive an email, please check your spam folder or contact Humanitarian ID Support.'));
        $scope.reset.$setPristine();
      }, function (error) {
        var msg = gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.');
        if (error.data && error.data.message === 'Email could not be found') {
          msg = gettextCatalog.getString('This email address does not exist.')
        }
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
