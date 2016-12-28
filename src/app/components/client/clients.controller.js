(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('ClientsCtrl', ClientsCtrl);

  ClientsCtrl.$inject = ['$scope', '$routeParams', 'Client'];

  function ClientsCtrl ($scope, $routeParams, Client) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';

    var setTotalClients = function (clients, headers) {
      $scope.totalItems = headers()["x-total-count"];
    };

    $scope.clients = Client.query($scope.request, setTotalClients);
  }
})();
