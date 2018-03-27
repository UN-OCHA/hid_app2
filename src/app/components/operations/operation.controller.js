(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationCtrl', OperationCtrl);

  OperationCtrl.$inject = ['$scope', '$routeParams', 'Operation', 'User', 'List', 'alertService', 'gettextCatalog'];

  function OperationCtrl($scope, $routeParams, Operation, User, List, alertService, gettextCatalog) {

    if ($routeParams.operationId) {
      $scope.operation = Operation.get({'operationId': $routeParams.operationId});
    }
    else {
      $scope.operation = new Operation();
    }

    $scope.newManagers = [];
    $scope.getManagers = getManagers;
    $scope.newKeyLists = [];
    $scope.getKeyLists = getKeyLists;
    $scope.newKeyRoles = [];
    $scope.getKeyRoles = getKeyRoles;

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

    function getManagers (search) {
      if (search === '') {
        return;
      }

      $scope.newManagers = User.query({name: search,  authOnly: false});
    }

    function getKeyLists (search) {
      if (search === '') {
        return;
      }

      $scope.newKeyLists = List.query({name: search});
    }

    function getKeyRoles (search) {
      if (search === '') {
        return;
      }

      $scope.newKeyRoles = List.query({name: search, type: 'functional_role'});
    }

  }
})();
