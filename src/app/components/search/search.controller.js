(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$location', '$scope', '$routeParams'];

  function SearchCtrl($location, $scope, $routeParams) {
    $scope.heading = $routeParams.q ? 'Search Results' : 'Humanitarian contacts';
    $scope.searchTerm = $routeParams.q;

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });

    $scope.fullSearch = function (searchTerm) {
      $location.path('/search').search({q: searchTerm});
    };

    $scope.clearSearch = function () {
      $scope.searchTerm = '';
      $location.path('/search').search({});
    };

  }

})();
