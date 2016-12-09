(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope', '$location', '$routeParams', 'SearchService'];

  function SearchCtrl($scope, $location, $routeParams, SearchService) {

    $scope.searchLists = [];
    $scope.searchPeople = [];
    $scope.searchComplete = false;
    var searchLimit = 50;

    if ($location.path() === '/search' && $routeParams.q) {

      SearchService.UsersAndLists($routeParams.q, searchLimit).then(function(data) {
        $scope.searchLists = data[0];
        $scope.searchPeople = data[1];
        $scope.searchComplete = true;
      });
    }

  }

})();
