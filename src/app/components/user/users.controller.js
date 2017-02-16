(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$log', '$q', '$scope', '$rootScope', '$routeParams', '$window', 'hrinfoService', 'SearchService', 'UserDataService', 'User', 'List'];
  function UsersCtrl($log, $q, $scope, $rootScope, $routeParams, $window, hrinfoService, SearchService, UserDataService, User, List) {
    $scope.request = {};
    $scope.totalItems = 0;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;
    $scope.selectedFilters = {};
    $scope.usersLoaded = false;
    var currentSortOrder = $scope.request.name;
    var defaultRequest = {
      limit: $scope.itemsPerPage,
      offset: 0,
      sort: 'name'
    };
    var listInfo = [];
    var operationIds = [];
    var selectedSortBy;
    $scope.request = angular.copy(defaultRequest);

    function getUsers () {
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      var params = angular.extend($scope.request, $scope.userFilters);
      UserDataService.getUsers(params, $scope.list, function () {
        $scope.users = UserDataService.listUsers;
        $scope.totalItems = UserDataService.listUsersTotal;
        if (selectedSortBy) {
          $scope.request.sort = selectedSortBy;
        }
        $scope.usersLoaded = true;
      });
    }

    function getMultipleLists (operationIds, search, type) {
      var promises = [];
      angular.forEach(operationIds, function(operationId) {
        promises.push(List.query({type: type, name: search, 'metadata.operation.id' : operationId}).$promise);
      });
      return $q.all(promises).then(function(data) {
        return data;
      }, function (error) {
        $log.error(error);
      });
    }

    function removeDuplicateLists (listsArray) {
      var deDupedLists = [];
      angular.forEach(listsArray, function(value) {
        var exists = false;
        angular.forEach(deDupedLists, function(val2) {
          if (angular.equals(value._id, val2._id)) {
            exists = true;
          }
        });
        if (exists === false && value._id !== '') {
          deDupedLists.push(value);
        }
      });
      return deDupedLists;
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
      getUsers();

      if ($scope.list) {
        operationIds = $scope.list.associatedOperations();
      }
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

      angular.forEach($scope.userTypes, function (type) {
        //handle unverified - switched to verified
        if ($scope.selectedFilters && $scope.selectedFilters.hasOwnProperty(type.value)) {
          $scope.selectedFilters.user_type = {};

          if ($scope.selectedFilters.verified === false) {
            $scope.selectedFilters.user_type = 'unverified';
          }

          $scope.selectedFilters.user_type = type.value;
          delete $scope.selectedFilters[type];
        }
      }); 
      $scope.request.sort = currentSortOrder;
    });

    function handleUserTypes () {
      angular.forEach($scope.userTypes, function (type) {
        if ($scope.request.hasOwnProperty(type.value)) {
          delete $scope.request[type.value];
        }
      }); 
      if ($scope.selectedFilters.user_type === undefined) {
        return;
      }
      delete $scope.userFilters.user_type;

      if ($scope.selectedFilters.user_type === 'unverified') {
        $scope.userFilters.verified = false;
        return;
      }

      $scope.userFilters[$scope.selectedFilters.user_type] = true;
    }

    $scope.filter = function() {
      $scope.usersLoaded = false;
      if ($scope.selectedFilters.name === '') {
        delete $scope.selectedFilters.name;
        delete $scope.request.name;
      }
      selectedSortBy = $scope.request.sort;
      if ($scope.request.sort !== 'name') {
        $scope.request.sort += ' name';
      }
      $scope.userFilters = angular.copy($scope.selectedFilters);

      if ($scope.selectedFilters.user_type || $scope.selectedFilters.user_type === undefined) {
        handleUserTypes();
      }
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

    $scope.operations = [];
    $scope.getOperations = function (search) {
      $scope.operations = List.query({type: 'operation', name: search});
    };

    $scope.bundles = [];
    $scope.getBundles = function(search) {
      if (operationIds && operationIds.length) {
        getMultipleLists(operationIds, search, 'bundle').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.bundles = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.bundles = List.query({type: 'bundle', name: search});
    };

    $scope.disasters = [];
    $scope.getDisasters = function(search) {
      if (operationIds && operationIds.length) {
        getMultipleLists(operationIds, search, 'disaster').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.disasters = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.disasters = List.query({type: 'disaster', name: search});
    };

    $scope.offices = [];
    $scope.getOffices = function(search) {
      if (operationIds && operationIds.length) {
        getMultipleLists(operationIds, search, 'office').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.offices = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.offices = List.query({type: 'office', name: search});
    };

    $scope.roles = [];
    $scope.getRoles = function (search) {
      $scope.roles = List.query({'type': 'functional_role', name: search});
    };

    $scope.organizations = [];
    $scope.getOrganizations = function(search) {
      $scope.organizations = List.query({type: 'organization', name: search});
    };

    $scope.countries = [];
    $scope.getCountries = function (search) {
      hrinfoService.getCountries({name: search}).then(function (d) {
        $scope.countries = d;
      });
    };

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
        label: '-verified',
        name: 'Verified'
      }
    ];
    $scope.userTypes = [
      {
        value: 'is_orphan',
        name: 'Orphan'
      },
      {
        value: 'is_ghost',
        name: 'Ghost'
      },
      {
        value: 'verified',
        name: 'Verified'
      },
      {
        value: 'unverified',
        name: 'Un-verified'
      },
      {
        value: 'is_admin',
        name: 'Adminstrator'
      }
    ];

    $scope.saveSearch = function (searchUser) {
      if ($scope.list || !$scope.searchTerm) {
        return;
      }
      SearchService.saveSearch($scope.currentUser, searchUser, 'user', function (user) {
        $scope.setCurrentUser(user);
      });
    };

  }

})();
