(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('ClientsController', ClientsController);

  ClientsController.$inject = ['$scope', '$routeParams', 'Client'];

  function ClientsController ($scope, $routeParams, Client) {
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalClients = function (clients, headers) {
      $scope.pagination.totalItems = headers()["x-total-count"];
    };

    function getClients (offset) {
      var params = {
        sort: 'name',
        limit: $scope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Client.query(params, function (clients, headers) {
        setTotalClients(clients, headers);
        $scope.clients = clients;
      });
    }

    getClients();

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getClients(offset);
    };

  }
})();
