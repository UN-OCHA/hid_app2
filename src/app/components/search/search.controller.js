(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope', '$routeParams', 'SearchService'];

  function SearchCtrl($scope, $routeParams, SearchService) {

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });

  }

})();
