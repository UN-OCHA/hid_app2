(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserNewController', UserNewController);

  UserNewController.$inject = ['$scope', '$location', '$window', 'alertService', 'User', 'gettextCatalog'];

  function UserNewController($scope, $location, $window, alertService, User, gettextCatalog) {
    var thisScope = $scope;

    thisScope.saving = false;
    thisScope.user = new User();
    thisScope.user.setAppMetaData({login: false});
    thisScope.user.locale = gettextCatalog.getCurrentLanguage();
    thisScope.isRegistration = $location.path() === '/register';
    thisScope.validPassword = false;
    thisScope.userCreate = userCreate;

    var verifyUrl = thisScope.isRegistration ? '/verify' : '/reset_password?orphan=true';
    thisScope.user.app_verify_url = $location.protocol() + '://' + $location.host() + verifyUrl;

    var newUserSuccessMsg = gettextCatalog.getString('The user was successfully created. If you inserted an email address, they will receive an email to claim their account. You can now edit the user profile to add more information.');
    var registrationSuccessMsg = gettextCatalog.getString('Thank you for creating an account. You will soon receive a confirmation email to confirm your account.');
    var successMessage = thisScope.isRegistration ? registrationSuccessMsg : newUserSuccessMsg;

    function userCreate (registerForm) {
      thisScope.saving = true;
      thisScope.user.$save(function(user) {
        alertService.add('success', successMessage, false, false, 6000);
        registerForm.$setPristine();
        registerForm.$setUntouched();
        thisScope.user = new User();
        thisScope.saving = false;

        if (thisScope.isRegistration) {
          $window.localStorage.setItem('hidNewUser', true);
          $location.path('/');
          return;
        }
        $location.path('/users/' + user._id);

      }, function () {
        registerForm.$setPristine();
        thisScope.saving = false;
      });
    };
  }

})();
