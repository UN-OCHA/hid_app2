var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'User', function($scope, $routeParams, $http, User) {
  if ($scope.currentUser.is_admin) {
    $scope.setAdminAvailable(true);
  }

}]);

