var userDirectives = angular.module('userDirectives', []);

userDirectives.directive('hidUsers', ['$rootScope', '$location', '$routeParams', 'gettextCatalog', 'alertService', 'hrinfoService', 'userService', 'User', 'List', function($rootScope, $location, $routeParams, gettextCatalog, alertService, hrinfoService, userService, User, List) {
  return {
    restrict: 'E',
    templateUrl: 'app/components/user/users.html',
    scope: false,
    link: function (scope, elem, attrs) {
      scope.inlist = scope.list ? true : false;
      scope.request = $location.search();
      scope.totalItems = 0;
      scope.itemsPerPage = 50;
      scope.currentPage = 1;
      scope.request.limit = scope.itemsPerPage;
      scope.request.offset = 0;
      scope.request.sort = 'name';
      scope.selectedFilters = {};
      scope.searchTerm = $routeParams.name;
      var currentSortOrder = scope.request.name;

      userService.setRequest(scope.request);

      // Helper function
      var queryCallback = function (users, headers) {
        scope.totalItems = users.length;
      };

      userService.subscribe(scope, function () {
        scope.currentPage = 1;
        scope.pageChanged();
      });

      $rootScope.$on('sidebar-closed', function () {
        scope.selectedFilters = angular.copy(scope.filters);
        scope.request.sort = currentSortOrder;
      });

      $rootScope.$on('$routeChangeSuccess', function () {
        scope.resetFilters();
      });

      // Pager function
      scope.pageChanged = function () {
        currentSortOrder = scope.request.sort;
        scope.request.offset = (scope.currentPage - 1) * scope.itemsPerPage;
        if (scope.inlist) {
          scope.request[scope.list.type + 's.list'] = scope.list._id;
        }
        userService.setRequest(scope.request);
        userService.filter(queryCallback);
        scope.users = userService.getUsers()
      };

      if (!scope.inlist) {
        scope.pageChanged();
      }

      scope.filter = function() {
        scope.filters = angular.copy(scope.selectedFilters);
        userService.setFilters(scope.filters);
        scope.currentPage = 1;
        scope.pageChanged();
      };

      scope.resetFilters = function () {
        userService.setFilters({});
        scope.filters = {};
        scope.selectedFilters = {};
        scope.currentPage = 1;
        scope.pageChanged();
      }

      //TO DO order asc / desc ?
      scope.sortList = function (sortby) {
        scope.request.sort = sortby;
        scope.currentPage = 1;
        scope.pageChanged();
      }

      scope.setLimit = function (limit) {
        scope.itemsPerPage = limit
        scope.request.limit = limit;
        scope.pageChanged();
      }

      scope.operations = List.query({type: 'operation'});

      scope.bundles = [];
      scope.getBundles = function(search) {
        scope.bundles = List.query({type: 'bundle', name: search});
      };

      scope.disasters = [];
      scope.getDisasters = function(search) {
        scope.disasters = List.query({type: 'disaster', name: search});
      };

      scope.roles = [];
      hrinfoService.getRoles().then(function (d) {
        scope.roles = d;
      });

      scope.organizations = [];
      scope.getOrganizations = function(search) {
        scope.organizations = List.query({type: 'organization', name: search});
      };

      scope.countries = [];
      hrinfoService.getCountries().then(function (d) {
        scope.countries = d;
      });

      scope.sortBy = [
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

      // Delete user account
      scope.deleteUser = function (user) {
        var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? This user will not be able to access Humanitarian ID anymore.'), true, function() {
          user.$delete(function (out) {
            alert.closeConfirm();
            alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
            scope.pageChanged();
          });
        });
      };
    }
  };
}]);
