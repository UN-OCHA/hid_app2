(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$location', '$scope', '$routeParams', 'gettextCatalog'];

  function SearchCtrl($location, $scope, $routeParams, gettextCatalog) {
    $scope.heading = $routeParams.q ? gettextCatalog.getString('Search Results') : gettextCatalog.getString('Humanitarian contacts');
    $scope.searchTerm = $routeParams.q;

    $scope.showLists = $routeParams.view === 'lists' ? true : false;

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
