(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListsCtrl', ListsCtrl);

  ListsCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'ListDataService', 'List'];

  function ListsCtrl($rootScope, $scope, $routeParams, $location, $q, gettextCatalog, hrinfoService, alertService, ListDataService, List) {
    $scope.request = {};
    $scope.totalItems = 0;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';

    $scope.listFilters = {};
    if ($routeParams.q) {
      $scope.listFilters.name = $routeParams.q;
      $scope.request.name = $routeParams.q;
    }
    $scope.selectedFilters = {};
    var currentSortOrder = $scope.request.name;
    ListDataService.setRequest($scope.request);

    $scope.listTypes = [
      {
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
      },
      {
        key: 'functional_role',
        val: 'Role'
      },
      {
        key: 'office',
        val: 'Co-ordination hub'
      },
      {
        key: 'list',
        val: 'Custom'
      }
    ];

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

    function formatTypes (lists) {
      var listType;

      angular.forEach(lists, function (list) {
        listType = $scope.listTypes.find(function (type) {
          return type.key === list.type;
        });
        list.type = listType.val;
      });
    }

    var queryCallback = function (resp) {
      $scope.totalItems = resp.headers["x-total-count"];
      formatTypes(resp);

      resp.$httpPromise.then(function (lists) {
        formatTypes(lists);
      });
    };

    ListDataService.subscribe($scope, function () {
      $scope.currentPage = 1;
      $scope.pageChanged();
    });

    $scope.lists = List.query($scope.request, queryCallback);

    $rootScope.$on('sidebar-closed', function () {
      $scope.selectedFilters = angular.copy($scope.listFilters);
      $scope.request.sort = currentSortOrder;
    });

    $scope.setLimit = function (limit) {
      $scope.itemsPerPage = limit;
      $scope.request.limit = limit;
      $scope.pageChanged();
    };

    $scope.resetFilters = function () {
      ListDataService.setFilters({});
      $scope.listFilters = {};
      $scope.selectedFilters = {};
      $scope.currentPage = 1;
      $scope.pageChanged();
    };

    $scope.pageChanged = function () {
      currentSortOrder = $scope.request.sort;
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      ListDataService.setRequest($scope.request);
      ListDataService.filter(queryCallback);
      $scope.lists = ListDataService.getLists();
    };

    $scope.filter = function() {
      $scope.listFilters = angular.copy($scope.selectedFilters);
      ListDataService.setFilters($scope.listFilters);
      $scope.currentPage = 1;
      $scope.pageChanged();
    };
  }
})();
