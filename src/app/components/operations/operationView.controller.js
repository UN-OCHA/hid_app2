(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationViewCtrl', OperationViewCtrl);

  OperationViewCtrl.$inject = ['$scope', '$rootScope', '$routeParams', 'ListDataService', 'Operation'];

  function OperationViewCtrl($scope, $rootScope, $routeParams, ListDataService, Operation) {

    $scope.groups = [];
    $scope.groupsLimit = 4;
    $scope.officesLimit = 4;
    $scope.disastersLimit = 4;
    $scope.offices = [];
    $scope.disasters = [];
    $scope.operation = {};
    $scope.operationList = {};
    $scope.isManager = false;

    var params = {
      url: $routeParams.operationUrl
    };

    Operation.query(params, function (operations, headers) {
      $scope.operation = operations[0];
      $scope.isManager = $scope.operation.isManager($scope.currentUser);
      $scope.operation.setListTypes();
      initOperationList();
      initGroups();
      initOffices();
      initDisasters();
    });


    function initGroups() {
      var groupsRequest = { type: 'bundle', sort: '-count' };
      groupsRequest['metadata.operation.id'] = $scope.operation.remote_id;
      ListDataService.queryLists(groupsRequest, function (lists, number) {
        $scope.groups = lists;
      });
    }

    function initOffices() {
      var officesRequest = { type: 'office', sort: '-count' };
      officesRequest['metadata.operation.id'] = $scope.operation.remote_id;
      ListDataService.queryLists(officesRequest, function (lists, number) {
        $scope.offices = lists;
      });
    }

    function initDisasters() {
      var disastersRequest = { type: 'disaster', sort: '-metadata.created' };
      disastersRequest['metadata.status[ne]'] = 'past';
      disastersRequest['metadata.operation.id'] = $scope.operation.remote_id;
      ListDataService.queryLists(disastersRequest, function (lists, number) {
        $scope.disasters = lists;
      });
    }

    function initOperationList() {
      var operationRequest = { type: 'operation', remote_id: $scope.operation.remote_id };
      ListDataService.queryLists(operationRequest, function (lists, number) {
        $scope.operationList = lists[0];
        $rootScope.title = $scope.operationList.name;
      });
    }

  }
})();
