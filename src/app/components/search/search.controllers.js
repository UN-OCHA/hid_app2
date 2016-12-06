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

appControllers.controller('SearchFormCtrl', ['$rootScope', '$scope', '$location', 'Search', 'User', 'List',
  function ($rootScope, $scope, $location, Search, User, List) {

  $scope.searchTerm = '';
  $scope.searchUsersTerm = '';
  $scope.searchListsTerm = '';
  $scope.searchLists = []
  $scope.searchPeople = []
  $scope.showAutocomplete = false;
  $scope.showUsersAutocomplete = false;
  $scope.showListsAutocomplete = false;
  var minSearchLength = 3;
  var searchLimit = 3;

  $scope.searchAutocomplete = function() {

    if ($scope.searchTerm.length < minSearchLength) {
      $scope.showAutocomplete = false;
      return;
    }

    Search.UsersAndLists($scope.searchTerm, searchLimit).then(function(data) {
      $scope.searchLists = data[0];
      $scope.searchPeople = data[1];
      $scope.showAutocomplete = data[0].length || data[1].length ? true : false;
    });
  };

  $scope.fullSearch = function (searchTerm) {
    $location.path('/search').search({q: searchTerm});
  }

  $scope.searchUsersAutocomplete = function () {
    if ($scope.searchUsersTerm.length < minSearchLength) {
      $scope.showUsersAutocomplete = false;
      return;
    }

    User.query({name: $scope.searchUsersTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
      $scope.landingUsers = data;
      $scope.showUsersAutocomplete = true;
    });
  }

  $scope.searchListsAutocomplete = function () {
    if ($scope.searchListsTerm.length < minSearchLength) {
      $scope.showListsAutocomplete = false;
      return;
    }

    List.query({name: $scope.searchListsTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
      $scope.landingLists = data;
      $scope.showListsAutocomplete = true;
    });
  }

  $rootScope.$on('$routeChangeSuccess', function () {
    $scope.showAutocomplete = false;
    $scope.searchTerm = '';
  });

}]);
