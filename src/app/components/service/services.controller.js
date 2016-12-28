(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServicesCtrl', ServicesCtrl);

  ServicesCtrl.$inject = ['$scope', '$routeParams', '$q', 'gettextCatalog', 'alertService', 'Service'];

  function ServicesCtrl ($scope, $routeParams, $q, gettextCatalog, alertService, Service) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';

    var queryCallback = function (clients, headers) {
      $scope.totalItems = headers()["x-total-count"];
    };

    $scope.services = Service.query($scope.request, queryCallback);
  }
})();
