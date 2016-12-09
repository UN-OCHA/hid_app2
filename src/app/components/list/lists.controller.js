(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('ListsCtrl', ListsCtrl);

  ListsCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'listService', 'List'];

  function ListsCtrl($rootScope, $scope, $routeParams, $location, $q, gettextCatalog, hrinfoService, alertService, listService, List) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';
    $scope.selectedFilters = {};
    var currentSortOrder = $scope.request.name;
    listService.setRequest($scope.request);

    $scope.listTypes = [{
      key: 'operation',
      val: 'Operation'
    },
    {
      key: 'bundle',
      val: 'Group'
    },
    {
      key: 'organization',
      val: 'Organization'
    },
    {
      key: 'disaster',
      val: 'Disaster'
    }];

    $scope.sortBy = [
      {
        label: 'name',
        name: 'Name'
      },
      {
        label: 'type',
        name: 'Type'
      }
    ];

    var queryCallback = function (resp) {
      $scope.totalItems = resp.headers["x-total-count"];
    };

    listService.subscribe($scope, function () {
      $scope.currentPage = 1;
      $scope.pageChanged();
    });


    $scope.lists = List.query($scope.request, queryCallback);

    $rootScope.$on('sidebar-closed', function () {
      $scope.selectedFilters = angular.copy($scope.filters);
      $scope.request.sort = currentSortOrder;
    });

    $scope.setLimit = function (limit) {
      $scope.itemsPerPage = limit
      $scope.request.limit = limit;
      $scope.pageChanged();
    }

    $scope.resetFilters = function () {
      listService.setFilters({});
      $scope.filters = {};
      $scope.selectedFilters = {};
      $scope.currentPage = 1;
      $scope.pageChanged();
    }

    $scope.pageChanged = function () {
      currentSortOrder = $scope.request.sort;
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      listService.setRequest($scope.request);
      listService.filter(queryCallback);
      $scope.lists = listService.getLists();
    };

    $scope.filter = function() {
      $scope.filters = angular.copy($scope.selectedFilters);
      listService.setFilters($scope.filters);
      $scope.currentPage = 1;
      $scope.pageChanged();
    };
  }
})();