(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('ClientsController', ClientsController);

  ClientsController.$inject = ['$scope', '$routeParams', 'Client'];

  function ClientsController ($scope, $routeParams, Client) {
    var thisScope = $scope;
    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 0,
      totalItems: 0
    };

    var setTotalClients = function (clients, headers) {
      thisScope.pagination.totalItems = headers()["x-total-count"];
    };

    function getClients (offset) {
      var params = {
        sort: 'name',
        limit: thisScope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Client.query(params, function (clients, headers) {
        setTotalClients(clients, headers);
        thisScope.clients = clients;
      });
    }

    getClients();

    thisScope.pageChanged = function () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getClients(offset);
    };

  }
})();
