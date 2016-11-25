appControllers.controller('SearchCtrl', ['$scope', '$location', '$routeParams', 'Search',
  function ($scope, $location, $routeParams, Search ) {

  $scope.searchLists = []
  $scope.searchPeople = []
  $scope.searchComplete = false;
  var searchLimit = 50;

  if ($location.path() === '/search' && $routeParams.q) {

    Search.UsersAndLists($routeParams.q, searchLimit).then(function(data) {
      $scope.searchLists = data[0];
      $scope.searchPeople = data[1];
      $scope.searchComplete = true;
    });
  }

}]);
