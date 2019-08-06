(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$location', '$scope', '$routeParams', 'gettextCatalog'];

  function SearchController($location, $scope, $routeParams, gettextCatalog) {
    $scope.heading = $routeParams.q ? gettextCatalog.getString('Search Results') : gettextCatalog.getString('Humanitarian contacts');
    $scope.searchTerm = $routeParams.q;

    $scope.showLists = $routeParams.view === 'lists' ? true : false;

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
