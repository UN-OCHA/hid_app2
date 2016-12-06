appControllers.controller('ContactListCtrl', ['$scope',
  function ($scope) {

  $scope.showUsers = true;

  $scope.$on('user-service-ready', function() {
    $scope.$broadcast('populate-list');
  });

}]);
