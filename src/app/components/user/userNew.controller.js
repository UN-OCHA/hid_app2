(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserNewCtrl', UserNewCtrl);

  UserNewCtrl.$inject = ['$scope', '$location', 'alertService', 'User', 'gettextCatalog'];

  function UserNewCtrl($scope, $location, alertService, User, gettextCatalog) {

    $scope.user = new User();
    $scope.user.locale = gettextCatalog.getCurrentLanguage();
    $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/reset_password';
    $scope.currentPath = $location.path();

    $scope.userCreate = function(registerForm) {
      $scope.user.$save(function(user) {
        alertService.add('success', gettextCatalog.getString('The user was successfully created. If you inserted an email address, he/she will receive an email to claim his account. You can now edit the user profile to add more information.'));
        registerForm.$setPristine();
        registerForm.$setUntouched();
        $scope.user = new User();
        $location.path('/users/' + user._id);
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error processing your registration.'));
        registerForm.$setPristine();
      });
    };
  }

})();
