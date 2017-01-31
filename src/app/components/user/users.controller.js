(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$log', '$q', '$scope', '$rootScope', '$routeParams', '$window', 'hrinfoService', 'UserDataService', 'User', 'List'];
  function UsersCtrl($log, $q, $scope, $rootScope, $routeParams, $window, hrinfoService, UserDataService, User, List) {
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

    $scope.request = angular.copy(defaultRequest);

    function getUsers () {
      $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      var params = angular.extend($scope.request, $scope.userFilters);

      // cached resource is returned immediately
      // User.query(params).$promise.then(function(users) {
      User.query(params, function(users) {
        $scope.users = transformUsers(users);
        $scope.totalItems = users.headers["x-total-count"];
        $scope.usersLoaded = true;

        // update users again when the http response resolves so don't lose pending
        // otherwise it overwrites them
        users.$httpPromise.then(function(users) {
          $scope.users = transformUsers(users, operationIds);
          $scope.totalItems = users.headers["x-total-count"];
        });
      });
    }

    function checkPending (user, listType, listId) {
      angular.forEach(user.listType, function (userList) {
        if ( (listId === userList.list._id) && userList.pending) {
          user.pending = true;
        }
      });
      return user;
    }

    function filterClusters (user, operationName) {
      var bundles = user.bundles;
      var operationBundles = [];
      var displayName = '';

      if (!bundles.length) {
        return user;
      }

      angular.forEach(bundles, function (bundle) {
        if (bundle.name.indexOf(operationName) !== -1) {
          displayName = bundle.name.replace(operationName + ' :', '');
          displayName = displayName.replace(operationName + ':', '');
          bundle.displayName = displayName;
          operationBundles.push(bundle);
        }
      });

      user.operationBundles = operationBundles;
      return user;
    }

    function transformUsers (users, operationIds) {
      if (!$scope.list) {
        return users;
      }

      angular.forEach(users, function (user) {
        checkPending(user, $scope.list.type + 's', $scope.list._id);

        if ($scope.list.type === 'operation') {
          filterClusters(user, $scope.list.name);
        }
      });

      return users;
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

    $rootScope.$on('users-export-csv', function () {
      var params = angular.extend($scope.request, $scope.filters);
      var url = User.getCSVUrl(params);
      $window.open(url);
    });

    $rootScope.$on('users-export-txt', function (evt, success, error) {
      var params = angular.extend($scope.request, $scope.filters);
      User.exportTXT(params, success, error);
    });

    $rootScope.$on('users-export-pdf', function (evt, format) {
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
      $scope.request.sort = currentSortOrder;
    });

    $scope.filter = function() {
      $scope.usersLoaded = false;
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
        label: 'verified',
        name: 'Verified'
      }
    ];

  }

})();
