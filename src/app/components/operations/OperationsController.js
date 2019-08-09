(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationsController', OperationsController);

  OperationsController.$inject = ['$scope', '$routeParams', 'Operation'];

  function OperationsController ($scope, $routeParams, Operation) {
    var thisScope = $scope;

    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalOperations = function (operations, headers) {
      thisScope.pagination.totalItems = headers()["x-total-count"];
    };

    function getOperations (offset) {
      var params = {
        sort: 'name',
        limit: thisScope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Operation.query(params, function (operations, headers) {
        setTotalOperations(operations, headers);
        thisScope.operations = operations;
      });
    }

    getOperations();

    thisScope.pageChanged = function () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getOperations(offset);
    };

  }
})();
