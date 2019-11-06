(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationController', OperationController);

  OperationController.$inject = ['$scope', '$routeParams', '$location', 'Operation', 'User', 'List', 'alertService', 'gettextCatalog'];

  function OperationController($scope, $routeParams, $location, Operation, User, List, alertService, gettextCatalog) {
    var thisScope = $scope;

    if ($routeParams.operationId) {
      thisScope.operation = Operation.get({'operationId': $routeParams.operationId});
    }
    else {
      thisScope.operation = new Operation();
    }

    thisScope.newManagers = [];
    thisScope.getManagers = getManagers;
    thisScope.newKeyLists = [];
    thisScope.getKeyLists = getKeyLists;
    thisScope.newKeyRoles = List.query({type: 'functional_role'});

    thisScope.saveOperation = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Operation saved successfully'));
        $location.path('/main/' + thisScope.operation.url);
      };
      var error = function (err) {
        $exceptionHandler(error, 'Save operation');
      };
      if (thisScope.operation._id) {
        thisScope.operation.$update(success, error);
      }
      else {
        thisScope.operation.$save(success, error);
      }
    };

    thisScope.deleteOperation = function () {
      thisScope.operation.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Operation deleted successfully'));
      });
    };

    function getManagers (search) {
      if (search === '') {
        return;
      }

      thisScope.newManagers = User.query({name: search,  authOnly: false});
    }

    function getKeyLists (search) {
      if (search === '') {
        return;
      }

      thisScope.newKeyLists = List.query({name: search});
    }

  }
})();
