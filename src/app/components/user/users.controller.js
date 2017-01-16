(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$scope', '$rootScope', '$routeParams', '$window', 'hrinfoService', 'UserDataService', 'User', 'List'];
  function UsersCtrl($scope, $rootScope, $routeParams, $window, hrinfoService, UserDataService, User, List) {
    $scope.request = {};
    $scope.totalItems = 0;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;
    $scope.selectedFilters = {};
    $scope.showAdmin = false;
    var currentSortOrder = $scope.request.name;
    var defaultRequest = {
      limit: $scope.itemsPerPage,
      offset: 0,
      sort: 'name'
    };
    var listInfo =[];

    $scope.request = angular.copy(defaultRequest);

    function getUsers () {
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      var params = angular.extend($scope.request, $scope.userFilters);
      UserDataService.getUsers(params).then(function (users) {
        $scope.users = checkPending(users);
        $scope.totalItems = users.headers["x-total-count"];
      });
    }

    function checkPending (users) {
      if (!$scope.list) {
        return users;
      }

      var listType = $scope.list.type + 's';

      angular.forEach(users, function (user) {
        angular.forEach(user[listType], function (list) {
          if ( ($scope.list._id === list.list._id) && list.pending) {
            user.pending = true;
          }
        });
      });
      return users;
    }

    $scope.$on('users-export-csv', function () {
      var params = angular.extend($scope.request, $scope.filters);
      var url = User.getCSVUrl(params);
      $window.open(url);
    });

    $scope.$on('users-export-txt', function (evt, success, error) {
      var params = angular.extend($scope.request, $scope.filters);
      User.exportTXT(params, success, error);
    });

    $scope.$on('users-export-pdf', function (evt, format) {
      var params = angular.extend($scope.request, $scope.filters);
      var url = User.getPDFUrl(params, format);
      $window.open(url);
    });

    $scope.$on('populate-list', function (event, listType) {
      $scope.userFilters = {};
      $scope.request = angular.extend($scope.request, listType);
      if ($routeParams.q) {
        $scope.request.name = $routeParams.q;
        $scope.userFilters.name = $routeParams.q;
        $scope.selectedFilters.name = $routeParams.q;
      }
      listInfo = listType;
      $scope.showAdmin = listType !== undefined ? true : false;
      getUsers();
    });

    $scope.pageChanged = function () {
      currentSortOrder = $scope.request.sort;
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      getUsers();
    };

    UserDataService.subscribe($scope, function (evt, request) {
      angular.merge($scope.request, request);
      $scope.currentPage = 1;
      getUsers();
    });

    $rootScope.$on('sidebar-closed', function () {
      $scope.selectedFilters = angular.copy($scope.userFilters);
      $scope.request.sort = currentSortOrder;
    });

    $scope.filter = function() {
      if ($scope.selectedFilters.name === '') {
        delete $scope.selectedFilters.name;
        delete $scope.request.name;
      }
      $scope.userFilters = angular.copy($scope.selectedFilters);
      $scope.currentPage = 1;
      getUsers();
    };

    $scope.resetFilters = function () {
      $scope.request = angular.copy(defaultRequest);
      if (listInfo) {
        $scope.request = angular.extend($scope.request, listInfo);
      }
      $scope.userFilters = {};
      $scope.selectedFilters = {};
      $scope.currentPage = 1;
      getUsers();
    };

    //TO DO order asc / desc ?
    $scope.sortList = function (sortby) {
      $scope.request.sort = sortby;
      $scope.currentPage = 1;
      getUsers();
    };

    $scope.setLimit = function (limit) {
      $scope.itemsPerPage = limit;
      $scope.request.limit = limit;
      getUsers();
    };

    $scope.operations = List.query({type: 'operation'});

    $scope.bundles = [];
    $scope.getBundles = function(search) {
      $scope.bundles = List.query({type: 'bundle', name: search});
    };

    $scope.disasters = [];
    $scope.getDisasters = function(search) {
      $scope.disasters = List.query({type: 'disaster', name: search});
    };

    $scope.roles = [];
    $scope.roles = List.query({'type': 'functional_role'}, function (roles) {
      $scope.roles = roles;
    });

    $scope.organizations = [];
    $scope.getOrganizations = function(search) {
      $scope.organizations = List.query({type: 'organization', name: search});
    };

    $scope.countries = [];
    hrinfoService.getCountries().then(function (d) {
      $scope.countries = d;
    });

    $scope.sortBy = [
      {
        label: 'name',
        name: 'Name'
      },
      {
        label: 'job_title',
        name: 'Job title'
      },
      {
        label: 'organization',
        name: 'Organization'
      },
      {
        label: 'verified',
        name: 'Verified'
      }
    ];

  }

})();
