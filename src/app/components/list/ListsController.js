(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListsController', ListsController);

  ListsController.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$q', '$localForage', 'gettextCatalog', 'hrinfoService', 'alertService', 'ListDataService', 'SearchService', 'SidebarService'];

  function ListsController($rootScope, $scope, $routeParams, $location, $q, $localForage, gettextCatalog, hrinfoService, alertService, ListDataService, SearchService, SidebarService) {
    var thisScope = $scope;

    thisScope.request = {};
    thisScope.totalItems = 0;
    thisScope.itemsPerPage = 50;
    thisScope.currentPage = 1;
    thisScope.request.limit = thisScope.itemsPerPage;
    thisScope.request.offset = 0;
    thisScope.request.sort = '-count';
    thisScope.listsLoaded = false;
    thisScope.selectedFilters = {};
    thisScope.listFilters = {};
    thisScope.currentFilters = [];

    var searchValue = $routeParams.q || $routeParams.name;

    if (searchValue) {
      thisScope.listFilters.name = searchValue;
      thisScope.request.name = searchValue;
      thisScope.selectedFilters.name = searchValue;
      thisScope.currentFilters.push({label: searchValue, filterType: 'name', type: 'name'});
    }
    if ($routeParams.type) {
      thisScope.selectedFilters.type = $routeParams.type;
      thisScope.listFilters.type = $routeParams.type;
      thisScope.request.type = $routeParams.type;
    }

    var currentSortOrder = thisScope.request.name;
    ListDataService.setRequest(thisScope.request);

    thisScope.listTypes = ListDataService.listTypes;

    thisScope.sortBy = [
      {
        label: 'name',
        name: 'Name'
      },
      {
        label: 'type',
        name: 'Type'
      },
      {
        label: '-count',
        name: 'Number of contacts'
      },
      {
        label: '-createdAt',
        name: 'Creation date'
      }
    ];

    function formatTypes (lists) {
      angular.forEach(lists, function (list) {
        ListDataService.setListTypeLabel(list);
      });
    }

    var queryCallback = function (lists, headers) {
      thisScope.totalItems = headers()["x-total-count"];
      formatTypes(lists);
      thisScope.listsLoaded = true;
    };

    ListDataService.subscribe($scope, function () {
      thisScope.currentPage = 1;
      thisScope.pageChanged();
    });
    ListDataService.queryLists(thisScope.request, function (lists, number) {
      thisScope.lists = lists;
      thisScope.totalItems = number;
      formatTypes(thisScope.lists);
      thisScope.listsLoaded = true;
    });

    $rootScope.$on('sidebar-closed', function () {
      thisScope.selectedFilters = angular.copy(thisScope.listFilters);
      thisScope.request.sort = currentSortOrder;
    });

    thisScope.setLimit = function (limit) {
      thisScope.itemsPerPage = limit;
      thisScope.request.limit = limit;
      thisScope.pageChanged();
    };

    thisScope.resetFilters = function () {
      ListDataService.setFilters({});
      thisScope.listFilters = {};
      thisScope.selectedFilters = {};
      thisScope.currentPage = 1;
      $location.search('type', null);
      $location.search('q', null);
      thisScope.currentFilters = [];
      thisScope.pageChanged();
    };

    thisScope.pageChanged = function () {
      currentSortOrder = thisScope.request.sort;
      thisScope.request.offset = (thisScope.currentPage - 1) * thisScope.itemsPerPage;
      ListDataService.setRequest(thisScope.request);
      ListDataService.filter(queryCallback);
      thisScope.lists = ListDataService.getLists();
    };

    function updateCurrentFilters (selectedFilters) {
      thisScope.currentFilters = [];
      if (selectedFilters.name) {
        thisScope.currentFilters.push({label: selectedFilters.name, filterType: 'name'});
      }

      if (selectedFilters.type) {
        var selected = thisScope.listTypes.filter(function (item) {
          return item.key === selectedFilters.type;
        })[0];
        thisScope.currentFilters.push({label: selected.val, filterType: 'type'});
      }
    }

    thisScope.removeFilter = function (filter) {
      if (thisScope.selectedFilters[filter.filterType]) {
        delete thisScope.selectedFilters[filter.filterType];
      }
      if (thisScope.request[filter.filterType]) {
        delete thisScope.request[filter.filterType];
      }
      thisScope.filter();
    };

    thisScope.filter = function() {
      thisScope.listsLoaded = false;

      if (thisScope.selectedFilters.name === '') {
        delete thisScope.selectedFilters.name;
        delete thisScope.request.name;
      }
      if (searchValue) {
        thisScope.listFilters.name = searchValue;
      }
      thisScope.listFilters = angular.copy(thisScope.selectedFilters);
      ListDataService.setFilters(thisScope.listFilters);
      thisScope.currentPage = 1;
      thisScope.pageChanged();
      updateCurrentFilters(thisScope.selectedFilters);
    };

    thisScope.applyFilters = function () {
      thisScope.filter();
      SidebarService.close();
    };

    thisScope.saveSearch = function (searchList) {
      if (!thisScope.searchTerm) {
        return;
      }
      SearchService.saveSearch(thisScope.currentUser, searchList, 'list', function (user) {
        thisScope.setCurrentUser(user);
      });
    };
  }
})();
