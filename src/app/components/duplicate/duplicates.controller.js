(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .controller('DuplicatesCtrl', DuplicatesCtrl);

  DuplicatesCtrl.$inject = ['$scope', '$routeParams', 'alertService', 'Duplicate', 'gettextCatalog'];

  function DuplicatesCtrl ($scope, $routeParams, alertService, Duplicate, gettextCatalog) {
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalDuplicates = function (duplicates, headers) {
      $scope.totalItems = headers()["x-total-count"];
    };

    function getDuplicates (offset) {
      var params = {
        sort: 'name',
        limit: $scope.pagination.itemsPerPage 
      };
      params.offset = offset || 0;

      Duplicate.query(params, function (duplicates, headers) {
        setTotalDuplicates(duplicates, headers);
        $scope.duplicates = duplicates;
      });
    }

    getDuplicates();

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getDuplicates(offset);
    };

    $scope.deleteDuplicate = function (duplicate, user) {
      duplicate.delete(user, function () {
        alertService.add('success', gettextCatalog.getString('Duplicate successfully removed'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error removing this duplicate'));
      });
    };
  }
})();
