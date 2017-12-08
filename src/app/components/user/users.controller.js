(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersCtrl', UsersCtrl);

  UsersCtrl.$inject = ['$exceptionHandler', '$location', '$q', '$rootScope', '$routeParams', '$scope', '$window', 'gettextCatalog', 'GAuth', 'GApi', 'alertService', 'hrinfoService', 'List', 'SearchService', 'SidebarService', 'User', 'UserDataService'];
  function UsersCtrl($exceptionHandler, $location, $q, $rootScope, $routeParams, $scope, $window, gettextCatalog, GAuth, GApi, alertService, hrinfoService, List, SearchService, SidebarService, User, UserDataService) {
    $scope.usersLoaded = false;
    $scope.pageChanged = pageChanged;
    $scope.setLimit = setLimit;
    $scope.operations = [];
    $scope.disasters = [];
    $scope.offices = [];
    $scope.roles = [];
    $scope.bundles = [];
    $scope.organizations = [];
    $scope.countries = [];
    $scope.selectedFilters = {};
    $scope.getBundles = getBundles;
    $scope.getCountries = getCountries;
    $scope.getDisasters = getDisasters;
    $scope.getOffices = getOffices;
    $scope.getOperations = getOperations;
    $scope.getOrganizations = getOrganizations;
    $scope.getRoles = getRoles;
    $scope.applyFilters = applyFilters;
    $scope.resetFilters = resetFilters;
    $scope.saveSearch = saveSearch;
    var activeFilters = {};

    $scope.sortBy = [
      {
        value: 'name',
        name: gettextCatalog.getString('Name')
      },
      {
        value: 'job_title',
        name: gettextCatalog.getString('Job title')
      },
      {
        value: 'organization',
        name: gettextCatalog.getString('Organization')
      },
      {
        value: '-verified',
        name: gettextCatalog.getString('Verified')
      }
    ];
    $scope.userTypes = [
      {
        value: 'is_orphan',
        label: gettextCatalog.getString('Orphan')
      },
      {
        value: 'is_ghost',
        label: gettextCatalog.getString('Ghost')
      },
      {
        value: 'verified',
        label: gettextCatalog.getString('Verified')
      },
      {
        value: 'unverified',
        label: gettextCatalog.getString('Un-verified')
      },
      {
        value: 'is_admin',
        label: gettextCatalog.getString('Adminstrator')
      },
      {
        value: 'authOnly',
        label: gettextCatalog.getString('Auth user')
      }
    ];
    $scope.orgTypes = [
      {
        label: gettextCatalog.getString('Academic / Research'),
        value: 431
      },
      {
        label: gettextCatalog.getString('Donor'),
        value: 433
      },
      {
        label: gettextCatalog.getString('Embassy'),
        value: 434
      },
      {
        label: gettextCatalog.getString('Government'),
        value: 435
      },
      {
        label: gettextCatalog.getString('International NGO'),
        value: 437
      },
      {
        label: gettextCatalog.getString('International Organization'),
        value: 438
      },
      {
        label: gettextCatalog.getString('Media'),
        value: 439
      },
      {
        label: gettextCatalog.getString('Military'),
        value: 440
      },
      {
        label: gettextCatalog.getString('National NGO'),
        value: 441
      },
      {
        label: gettextCatalog.getString('Other'),
        value: 443
      },
      {
        label: gettextCatalog.getString('Private sector'),
        value: 444
      },
      {
        label: gettextCatalog.getString('Red Cross / Red Crescent'),
        value: 445
      },
      {
        label: gettextCatalog.getString('Religious'),
        value: 446
      },
      {
        label: gettextCatalog.getString('United Nations'),
        value: 447
      },
      {
        label: gettextCatalog.getString('Unknown'),
        value: 54593
      }
    ];

    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 50
    };
    $scope.currentFilters = {
      all: [],
      remove: removeFilter
    };

    var defaultRequest = {
      limit: $scope.pagination.itemsPerPage,
      offset: 0,
      sort: 'name'
    };

    var currentRequest = angular.copy(defaultRequest);

    function getUsers(params) {
      if (!$scope.currentUser.is_admin && !$scope.currentUser.isManager) {
        params.authOnly = false;
      }

      UserDataService.getUsers(params, $scope.list, function () {
        $scope.users = UserDataService.listUsers;
        $scope.totalItems = UserDataService.listUsersTotal;
        $scope.usersLoaded = true;
      });
    }

    function pageChanged () {
      $scope.usersLoaded = false;
      currentRequest.offset = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
      getUsers(currentRequest);
    }

    function setLimit (limit) {
      $scope.usersLoaded = false;
      $scope.pagination.itemsPerPage = limit;
      currentRequest.limit = limit;
      getUsers(currentRequest);
    }

    $scope.$on('populate-list', function (event, listType) {

      if ($scope.list) {
        defaultRequest = angular.extend(defaultRequest, listType);
        $scope.operationIds = $scope.list.fromCache ? [] : $scope.list.associatedOperations();
      }

      currentRequest = angular.copy(defaultRequest);
      currentRequest = angular.extend(currentRequest, listType);

      var qs = $routeParams;
      if (qs.list) {
        delete qs.list;
      }

      if (qs && Object.keys(qs).length) {
        $scope.selectedFilters = angular.copy(qs);

        if ($scope.selectedFilters.sort) {
          $scope.selectedFilters.sort = unFormatSortType($scope.selectedFilters.sort);
        }

        unFormatUserTypes($scope.selectedFilters);
        populateFilters($scope.selectedFilters);
        activeFilters = angular.copy($scope.selectedFilters);
        currentRequest = angular.extend(currentRequest, qs);
      }
      getUsers(currentRequest);
    });

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

    function getMultipleLists (operationIds, search, type) {
      var promises = [];
      angular.forEach(operationIds, function(operationId) {
        promises.push(List.query({type: type, name: search, 'metadata.operation.id' : operationId}).$promise);
      });
      return $q.all(promises).then(function(data) {
        return data;
      }, function (error) {
        $exceptionHandler(error, 'Filters - getMultipleLists');
      });
    }

    function getBundles (search) {
      if ($scope.operationIds && $scope.operationIds.length) {
        getMultipleLists($scope.operationIds, search, 'bundle').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.bundles = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.bundles = List.query({type: 'bundle', name: search});
    }

    function getCountries (search, callback) {
      hrinfoService.getCountries({name: search}).then(function (countries) {
        $scope.countries = countries;
        if (callback) {
          return callback();
        }
      });
    }

    function getDisasters(search) {
      if ($scope.operationIds && $scope.operationIds.length) {
        getMultipleLists($scope.operationIds, search, 'disaster').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.disasters = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.disasters = List.query({type: 'disaster', name: search});
    }

    function getOffices (search) {
      if ($scope.operationIds && $scope.operationIds.length) {
        getMultipleLists($scope.operationIds, search, 'office').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          $scope.offices = removeDuplicateLists(mergedArray);
        });
        return;
      }
      $scope.offices = List.query({type: 'office', name: search});
    }

    function getOperations (search) {
      $scope.operations = List.query({type: 'operation', name: search});
    }

    function getOrganizations (search) {
      $scope.organizations = List.query({type: 'organization', name: search});
    }

    function getRoles (search) {
      $scope.roles = List.query({'type': 'functional_role', name: search});
    }

    function formatUserTypes (filters) {
      var type = filters.user_type;
      if (type === undefined) {
        return;
      }
      delete filters.user_type;

      if (type === 'unverified') {
        filters.verified = false;
        return;
      }

      filters[type] = true;
    }

    function unFormatUserTypes (filters) {
      if (filters.verified === 'false') {
        delete filters.verified;
        filters.user_type = 'unverified';
        return;
      }

      angular.forEach($scope.userTypes, function (userType) {
        if (filters[userType.value]) {
          delete filters[userType.value];
          filters.user_type = userType.value;
        }
      });
    }

    function getListType (type) {
      var listIndex = type.indexOf('.list');
      if (listIndex !== -1) {
        return type.substr(0, listIndex);
      }
    }

    function populateFilters (filters) {
      angular.forEach(filters, function (value, type) {
        var typeLabel = getListType(type);
        if (typeLabel) {

          List.get({'listId': value}, function (list) {
            if (typeLabel === 'functional_roles') {
              $scope.roles.push(list);
              populateCurrentFilter(value, type, $scope.currentFilters.all);
              return;
            }
            $scope[typeLabel].push(list);
            populateCurrentFilter(value, type, $scope.currentFilters.all);
          });
          return;
        }

        if (type === 'country') {
          getCountries('', function () {
            populateCurrentFilter(value, type, $scope.currentFilters.all);
          });
        }

        if (type === 'organizations.orgTypeId') {
          filters[type] = parseInt(value, 10);
          populateCurrentFilter(value, type, $scope.currentFilters.all);
        }

        if (type === 'user_type' || type === 'name' || type === 'q') {
          populateCurrentFilter(value, type, $scope.currentFilters.all);
        }
      });
    }

    function populateCurrentFilter (value, type) {
      var selected;
      var item;
      var typeLabel = getListType(type);
      var label;

      if (type === 'sort') {
        return;
      }

      if (typeLabel) {
        var arrayLabel = typeLabel;
        if (typeLabel === 'functional_roles') {
          arrayLabel = 'roles';
        }
        selected = $scope[arrayLabel].filter(function(item) {
          return item._id === value;
        })[0];
        if (!selected) {
          return;
        }
        label = selected.name;
      }

      if (type === 'country') {
        selected = $scope.countries.filter(function(item) {
          return item.id === value;
        })[0];
        if (!selected) {
          return;
        }
        label = selected.name;
      }

      if (type === 'organizations.orgTypeId') {
        selected = $scope.orgTypes.filter(function(item) {
          return item.value === value ||  item.value === parseInt(value, 10);
        })[0];
        if (!selected) {
          return;
        }
        label = selected.label;
      }

      if (type === 'user_type') {
        selected = $scope.userTypes.filter(function(item) {
          return item.value === value;
        })[0];
        if (!selected) {
          return;
        }
        label = selected.label;
      }

      if (type === 'name' || type === 'q') {
        label = value;
        type = 'name';
      }

      item = {
        _id: value,
        label: label,
        type: type
      };

      $scope.currentFilters.all.push(item);
    }

    function populateCurrentFilters (filters) {
      $scope.currentFilters.all = [];
      angular.forEach(filters, function (value, type) {
        populateCurrentFilter(value, type, $scope.currentFilters.all);
      });
    }

    function filterUsers () {
      activeFilters = angular.copy($scope.selectedFilters);
      var formattedFilters = angular.copy($scope.selectedFilters);
      if (formattedFilters.user_type || formattedFilters.user_type === undefined) {
        formatUserTypes(formattedFilters);
      }

      if (formattedFilters.sort && formattedFilters.sort.indexOf('name') === -1) {
        formattedFilters.sort += ' name';
      }

      populateCurrentFilters($scope.selectedFilters);
      $scope.usersLoaded = false;
      $scope.pagination.currentPage = 1;
      currentRequest = angular.copy(defaultRequest);
      currentRequest = angular.extend(currentRequest, formattedFilters);
      currentRequest.offset = 0;

      getUsers(currentRequest);

      $location.search(formattedFilters);
    }

    function applyFilters () {
      filterUsers();
      SidebarService.close();
    }

    function resetFilters () {
      $scope.selectedFilters = {};
      activeFilters = {};
      filterUsers();
      $scope.currentFilters.all = [];
    }

    function removeFilter (filter) {
      $scope.currentFilters.all = $scope.currentFilters.all.filter(function (item) {
        return item._id !== filter._id;
      });

      if (filter.type === 'name' && $scope.selectedFilters.q) {
        delete $scope.selectedFilters.q;
      }

      if ($scope.selectedFilters[filter.type]) {
        if (filter.type === 'user_type') {

          if (filter._id === 'unverified') {
            delete $scope.selectedFilters.verified;
          }

          if ($scope.selectedFilters[filter._id]) {
            delete $scope.selectedFilters[filter._id];
          }
        }

        delete $scope.selectedFilters[filter.type];
      }
      filterUsers();
      // activeFilters = angular.copy($scope.selectedFilters);
      // $location.search($scope.selectedFilters);
    }

    function unFormatSortType (sortType) {
      var sortIndex = sortType.indexOf(' name');
      if (sortIndex !== -1) {
        return sortType.substr(0, sortIndex);
      }
    }

    function saveSearch (searchUser) {
      if ($scope.list || !$routeParams.q && !$routeParams.name) {
        return;
      }
      SearchService.saveSearch($scope.currentUser, searchUser, 'user', function (user) {
        $scope.setCurrentUser(user);
      });
    }

    $rootScope.$on('sidebar-closed', function () {
      $scope.selectedFilters = angular.copy(activeFilters);
    });

    $scope.$on('users-export-csv', function () {
      var url = User.getCSVUrl(currentRequest);
      $window.open(url);
    });

    $scope.$on('users-export-txt', function (evt, success, error) {
      User.exportTXT(currentRequest, success, error);
    });

    $scope.$on('users-export-pdf', function (evt, format) {
      var url = User.getPDFUrl(currentRequest, format);
      $window.open(url);
    });

    $scope.$on('users-export-gss', function (evt, doc) {
      User.exportGSS(currentRequest, function(resp) {
        var values = [];
        var data = [];
        var index = 2;
        var organization = '',
          country = '',
          region = '',
          skype = '',
          bundles = '',
          roles = '';
        data.push({
          range: 'A1:M1',
          values: [['Humanitarian ID', 'First Name', 'Last Name', 'Job Title', 'Organization', 'Groups', 'Roles', 'Country', 'Admin Area', 'Phone number', 'Skype', 'Email', 'Notes']]
        });
        resp.data.forEach(function (elt) {
          organization = elt.organization ? elt.organization.name : '';
          country = '';
          region = '';
          skype = '';
          bundles = '';
          roles = '';
          if (elt.location && elt.location.country) {
            country = elt.location.country.name;
          }
          if (elt.location && elt.location.region) {
            region = elt.location.region.name;
          }
          if (elt.voips.length) {
            elt.voips.forEach(function (voip) {
              if (voip.type === 'Skype') {
                skype = voip.username;
              }
            });
          }
          if (elt.bundles && elt.bundles.length) {
            elt.bundles.forEach(function (bundle) {
              bundles += bundle.name + ';';
            });
          }
          if (elt.functional_roles && elt.functional_roles.length) {
            elt.functional_roles.forEach(function (role) {
              roles += role.name + ';';
            });
          }
          data.push({
            range: 'A' + index + ':M' + index,
            values: [[elt.id, elt.given_name, elt.family_name, elt.job_title, organization, bundles, roles, country, region, elt.phone_number, skype, elt.email, elt.status]]
          });
          index++;
        });
        var body = {
          data: data,
          valueInputOption: 'RAW'
        };
        GApi.execute('sheets', 'spreadsheets.values.batchUpdate', {
          spreadsheetId: doc.id,
          resource: body
        }).then(function(resp) {
          alertService.add('success', gettextCatalog.getString('The users were successfully exported.'));
        }, function() {
          alertService.add('danger', gettextCatalog.getString('Sorry, the spreadsheet export did not work...'));
        });
      }, function (err) {
        alertService.add('danger', gettextCatalog.getString('Sorry, we could not retrieve the users...'));
      });
    });

    function init () {
      UserDataService.subscribe($scope, function () {
        getUsers(currentRequest);
      });
    }

    init();

  }

})();
