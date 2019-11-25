(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$location', '$scope', '$routeParams', 'gettextCatalog'];

  function SearchController($location, $scope, $routeParams, gettextCatalog) {
    var thisScope = $scope;

    thisScope.heading = $routeParams.q ? gettextCatalog.getString('Search Results') : gettextCatalog.getString('Humanitarian contacts');
    thisScope.searchTerm = $routeParams.q;

    thisScope.showLists = $routeParams.view === 'lists' ? true : false;

    thisScope.$on('user-service-ready', function() {
      thisScope.$broadcast('populate-list');
    });
  }

})();
