(function () {
  'use strict';

  angular
    .module('app.operations')
    .controller('OperationViewController', OperationViewController);

  OperationViewController.$inject = ['$scope', '$rootScope', '$routeParams', 'ListDataService', 'Operation'];

  function OperationViewController($scope, $rootScope, $routeParams, ListDataService, Operation) {
    var thisScope = $scope;

    thisScope.groups = [];
    thisScope.groupsLimit = 4;
    thisScope.officesLimit = 4;
    thisScope.disastersLimit = 4;
    thisScope.offices = [];
    thisScope.disasters = [];
    thisScope.operation = {};
    thisScope.operationList = {};
    thisScope.isManager = false;

    var params = {
      url: $routeParams.operationUrl
    };

    Operation.query(params, function (operations, headers) {
      thisScope.operation = operations[0];
      thisScope.isManager = thisScope.operation.isManager(thisScope.currentUser);
      thisScope.operation.setListTypes();
      initOperationList();
      initGroups();
      initOffices();
      initDisasters();
    });


    function initGroups() {
      var groupsRequest = { type: 'bundle', sort: '-count' };
      groupsRequest['metadata.operation.id'] = thisScope.operation.remote_id;
      ListDataService.queryLists(groupsRequest, function (lists, number) {
        thisScope.groups = lists;
      });
    }

    function initOffices() {
      var officesRequest = { type: 'office', sort: '-count' };
      officesRequest['metadata.operation.id'] = thisScope.operation.remote_id;
      ListDataService.queryLists(officesRequest, function (lists, number) {
        thisScope.offices = lists;
      });
    }

    function initDisasters() {
      var disastersRequest = { type: 'disaster', sort: '-metadata.created' };
      disastersRequest['metadata.status[ne]'] = 'past';
      disastersRequest['metadata.operation.id'] = thisScope.operation.remote_id;
      ListDataService.queryLists(disastersRequest, function (lists, number) {
        thisScope.disasters = lists;
      });
    }

    function initOperationList() {
      var operationRequest = { type: 'operation', remote_id: thisScope.operation.remote_id };
      ListDataService.queryLists(operationRequest, function (lists, number) {
        thisScope.operationList = lists[0];
        $rootScope.title = thisScope.operationList.name;
      });
    }

  }
})();
