var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'User', function($scope, $routeParams, $http, User) {
  $scope.fullStatus = '';

  switch ($scope.currentUser.status) {
    case 'base':
      $scope.fullStatus = 'You are currently at base';
      break;
    case 'mission':
      $scope.fullStatus = 'You are currently on mission until ' + $scope.user.departure.toLocaleDateString();
      break;
    case 'responding':
      $scope.fullStatus = 'You are currently responding to ' + user.disaster.name + ' until ' + $scope.user.departure.toLocaleDateString();
      break;
  }
}]);

