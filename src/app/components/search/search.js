appControllers.controller('SearchCtrl', ['$scope', '$location', 'userService', 'listService',
  function ($scope, $location,  userService, listService) {

  $scope.filters = {};

  $scope.searchUsers = function () {
    var path = $location.path();
    if (path == '/users' || path.indexOf('/lists/') !== -1) {
      userService.addFilter('name', $scope.filters.name, true);
    }
    if (path == '/lists') {
      listService.addFilter('name', $scope.filters.name, true);
    }
  };
}]);
