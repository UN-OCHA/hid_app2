(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationsCtrl', OperationsCtrl);

  OperationsCtrl.$inject = ['$scope', '$routeParams', 'Operation'];

  function OperationsCtrl ($scope, $routeParams, Operation) {
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalOperations = function (operations, headers) {
      $scope.pagination.totalItems = headers()["x-total-count"];
    };

    function getOperations (offset) {
      var params = {
        sort: 'name',
        limit: $scope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Operation.query(params, function (operations, headers) {
        setTotalOperations(operations, headers);
        $scope.operations = operations;
      });
    }

    getOperations();

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getOperations(offset);
    };

  }
})();
