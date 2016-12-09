hidControllers.controller('UserRegisterCtrl', ['$scope', '$location', 'alertService', 'User', 'gettextCatalog', function ($scope, $location, alertService, User, gettextCatalog) {
  $scope.user = new User();
  $scope.user.locale = gettextCatalog.getCurrentLanguage();
  $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/verify';
  $scope.currentPath = $location.path();

  $scope.userCreate = function(registerForm) {
    $scope.user.$save(function(user) {
      alertService.add('success', gettextCatalog.getString('Thank you for creating an account. You will soon receive a confirmation email to confirm your account.'));
      registerForm.$setPristine();
      registerForm.$setUntouched();
      $scope.user = new User();
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error processing your registration.'));
      registerForm.$setPristine();
    });
  };
}]);
