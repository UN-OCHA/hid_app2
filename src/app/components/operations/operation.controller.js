(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationCtrl', OperationCtrl);

  OperationCtrl.$inject = ['$scope', '$routeParams', 'Operation', 'alertService', 'gettextCatalog'];

  function OperationCtrl($scope, $routeParams, Operation, alertService, gettextCatalog) {

    if ($routeParams.operationId) {
      $scope.operation = Operation.get({'operationId': $routeParams.operationId});
    }
    else {
      $scope.operation = new Operation();
    }

    $scope.saveOperation = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Operation saved successfully'));
      };
      var error = function (err) {
        $exceptionHandler(error, 'Save operation');
      };
      if ($scope.operation._id) {
        $scope.operation.$update(success, error);
      }
      else {
        $scope.operation.$save(success, error);
      }
    };

    $scope.deleteOperation = function () {
      $scope.operation.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Operation deleted successfully'));
      });
    };

  }
})();
