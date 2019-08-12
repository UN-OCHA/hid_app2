(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .controller('DuplicatesController', DuplicatesController);

  DuplicatesController.$inject = ['$exceptionHandler', '$scope', '$routeParams', 'alertService', 'Duplicate', 'gettextCatalog'];

  function DuplicatesController ($exceptionHandler, $scope, $routeParams, alertService, Duplicate, gettextCatalog) {
    var thisScope = $scope;
    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalDuplicates = function (duplicates, headers) {
      thisScope.pagination.totalItems = headers()["x-total-count"];
    };

    function getDuplicates (offset) {
      var params = {
        sort: 'name',
        limit: thisScope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Duplicate.query(params, function (duplicates, headers) {
        setTotalDuplicates(duplicates, headers);
        thisScope.duplicates = duplicates;
      });
    }

    getDuplicates();

    thisScope.pageChanged = function () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getDuplicates(offset);
    };

    thisScope.deleteDuplicate = function (duplicate, user) {
      duplicate.delete(user, function () {
        alertService.add('success', gettextCatalog.getString('Duplicate successfully removed'));
      }, function (error) {
        $exceptionHandler(error, 'Removing duplicate');
      });
    };
  }
})();
