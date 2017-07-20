(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserNewCtrl', UserNewCtrl);

  UserNewCtrl.$inject = ['$scope', '$location', '$window', 'alertService', 'User', 'gettextCatalog'];

  function UserNewCtrl($scope, $location, $window, alertService, User, gettextCatalog) {
    $scope.saving = false;
    $scope.user = new User();
    $scope.user.setAppMetaData({login: false});
    $scope.user.locale = gettextCatalog.getCurrentLanguage();
    $scope.isRegistration = $location.path() === '/register';
    $scope.validPassword = false;
    $scope.userCreate = userCreate;

    var verifyUrl = $scope.isRegistration ? '/verify' : '/reset_password?orphan=true';
    $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + verifyUrl;

    var newUserSuccessMsg = gettextCatalog.getString('The user was successfully created. If you inserted an email address, they will receive an email to claim their account. You can now edit the user profile to add more information.');
    var newUserErrorMsg = gettextCatalog.getString('There was an error processing your registration.');
    var registrationSuccessMsg = gettextCatalog.getString('Thank you for creating an account. You will soon receive a confirmation email to confirm your account.');
    var registrationErrorMsg = gettextCatalog.getString('There was an error processing your registration.');
    var successMessage = $scope.isRegistration ? registrationSuccessMsg : newUserSuccessMsg;
    var errorMessage = $scope.isRegistration ? registrationErrorMsg : newUserErrorMsg;

    function userCreate (registerForm) {
      $scope.saving = true;
      $scope.user.$save(function(user) {
        alertService.add('success', successMessage, false, false, 6000);
        registerForm.$setPristine();
        registerForm.$setUntouched();
        $scope.user = new User();
        $scope.saving = false;

        if ($scope.isRegistration) {
          $window.localStorage.setItem('hidNewUser', true);
          $location.path('/');
          return;
        }
        $location.path('/users/' + user._id);

      }, function () {
        alertService.add('danger', errorMessage);
        registerForm.$setPristine();
        $scope.saving = false;
      });
    };
  }

})();
