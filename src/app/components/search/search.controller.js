(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$location', '$scope', '$routeParams'];

  function SearchCtrl($location, $scope, $routeParams) {
    $scope.heading = $routeParams.q ? 'Search Results' : 'Humanitarian contacts';
    $scope.searchTerm = $routeParams.q;

    $scope.showLists = $routeParams.view === 'lists' ? true : false;

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
