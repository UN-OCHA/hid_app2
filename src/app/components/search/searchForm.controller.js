appControllers.controller('SearchFormCtrl', ['$rootScope', '$scope', '$location', 'Search',
  function ($rootScope, $scope, $location, Search) {

  $scope.searchTerm = '';
  $scope.searchLists = []
  $scope.searchPeople = []
  $scope.hasResults = false;
  var minSearchLength = 3;
  var searchLimit = 3;

  $scope.search = function (path, searchTerm) {
    var params = {
      name: searchTerm
    };
    $location.path(path).search(params);
  }

  $scope.searchAutocomplete = function() {
    if (!$scope.searchTerm.length) {
      $scope.hasResults = false;
    }
    if ($scope.searchTerm.length < minSearchLength) {
      return;
    }

    Search.UsersAndLists($scope.searchTerm, searchLimit).then(function(data) {
      $scope.searchLists = data[0];
      $scope.searchPeople = data[1];
      $scope.hasResults = data[0].length || data[1].length ? true : false;
    });
  };

  $scope.fullSearch = function () {
    $location.path('/search').search({q: $scope.searchTerm});
  }

  $rootScope.$on('$routeChangeSuccess', function () {
    $scope.hasResults = false;
    $scope.searchTerm = '';
  });

}]);
