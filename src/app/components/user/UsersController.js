(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersController', UsersController);

  UsersController.$inject = ['$exceptionHandler', '$location', '$q', '$rootScope', '$routeParams', '$scope', '$window', 'gettextCatalog', 'alertService', 'hrinfoService', 'List', 'SearchService', 'SidebarService', 'User', 'UserDataService'];

  function UsersController($exceptionHandler, $location, $q, $rootScope, $routeParams, $scope, $window, gettextCatalog, alertService, hrinfoService, List, SearchService, SidebarService, User, UserDataService) {
    var thisScope = $scope;
    thisScope.usersLoaded = false;
    thisScope.pageChanged = pageChanged;
    thisScope.setLimit = setLimit;
    thisScope.operations = [];
    thisScope.disasters = [];
    thisScope.offices = [];
    thisScope.roles = [];
    thisScope.bundles = [];
    thisScope.organizations = [];
    thisScope.countries = [];
    thisScope.selectedFilters = {};
    thisScope.getBundles = getBundles;
    thisScope.getCountries = getCountries;
    thisScope.getDisasters = getDisasters;
    thisScope.getOffices = getOffices;
    thisScope.getOperations = getOperations;
    thisScope.getOrganizations = getOrganizations;
    thisScope.applyFilters = applyFilters;
    thisScope.resetFilters = resetFilters;
    thisScope.saveSearch = saveSearch;
    var activeFilters = {};

    thisScope.sortBy = [
      {
        value: 'name',
        name: gettextCatalog.getString('Name')
      },
      {
        value: 'job_title',
        name: gettextCatalog.getString('Job title')
      },
      {
        value: 'organization.acronymsOrNames.' + gettextCatalog.getCurrentLanguage(),
        name: gettextCatalog.getString('Organization')
      },
      {
        value: '-verified',
        name: gettextCatalog.getString('Verified')
      },
      {
        value: '-createdAt',
        name: gettextCatalog.getString('Creation date')
      }
    ];
    thisScope.userTypes = [
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
        value: 'isManager',
        label: gettextCatalog.getString('Manager')
      },
      {
        value: 'is_admin',
        label: gettextCatalog.getString('Adminstrator')
      },
      {
        value: 'authOnly',
        label: gettextCatalog.getString('Auth user')
      },
      {
        value: 'profiles',
        label: gettextCatalog.getString('Profile users')
      }
    ];
    thisScope.orgTypes = [
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
    thisScope.roles = List.roles;

    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 50
    };
    thisScope.currentFilters = {
      all: [],
      remove: removeFilter
    };

    var defaultRequest = {
      limit: thisScope.pagination.itemsPerPage,
      offset: 0,
      sort: 'name'
    };

    var currentRequest = angular.copy(defaultRequest);

    function getUsers(params) {
      if (!thisScope.currentUser.is_admin && !thisScope.currentUser.isManager) {
        params.authOnly = false;
      }

      // Get users from API first
      if ($rootScope.isOnline) {
        UserDataService.getUsersFromServer(params, thisScope.list, function (nbUsers, users) {
          thisScope.users = users;
          thisScope.totalItems = nbUsers;
          thisScope.usersLoaded = true;
        });
      }
      else {
        UserDataService.getUsersFromCache(params, thisScope.list, function (nbUsers, users) {
          thisScope.users = users;
          thisScope.totalItems = nbUsers;
          thisScope.usersLoaded = true;
        });
      }
    }

    function pageChanged () {
      thisScope.usersLoaded = false;
      currentRequest.offset = (thisScope.pagination.currentPage - 1) * thisScope.pagination.itemsPerPage;
      getUsers(currentRequest);
    }

    function setLimit (limit) {
      thisScope.usersLoaded = false;
      thisScope.pagination.itemsPerPage = limit;
      currentRequest.limit = limit;
      getUsers(currentRequest);
    }

    thisScope.$on('populate-list', function (event, listType) {

      if (thisScope.list) {
        defaultRequest = angular.extend(defaultRequest, listType);
        thisScope.operationIds = thisScope.list.fromCache ? [] : thisScope.list.associatedOperations();
      }

      currentRequest = angular.copy(defaultRequest);
      currentRequest = angular.extend(currentRequest, listType);

      var qs = $routeParams;
      if (qs.list) {
        delete qs.list;
      }

      if (qs && Object.keys(qs).length) {
        thisScope.selectedFilters = angular.copy(qs);

        if (thisScope.selectedFilters.sort) {
          thisScope.selectedFilters.sort = unFormatSortType(thisScope.selectedFilters.sort);
        }

        unFormatUserTypes(thisScope.selectedFilters);
        populateFilters(thisScope.selectedFilters);
        activeFilters = angular.copy(thisScope.selectedFilters);
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
      if (thisScope.operationIds && thisScope.operationIds.length) {
        getMultipleLists(thisScope.operationIds, search, 'bundle').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          thisScope.bundles = removeDuplicateLists(mergedArray);
        });
        return;
      }
      thisScope.bundles = List.query({type: 'bundle', name: search});
    }

    function getCountries (search, callback) {
      hrinfoService.getCountries({name: search}).then(function (countries) {
        thisScope.countries = countries;
        if (callback) {
          return callback();
        }
      });
    }

    function getDisasters(search) {
      if (thisScope.operationIds && thisScope.operationIds.length) {
        getMultipleLists(thisScope.operationIds, search, 'disaster').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          thisScope.disasters = removeDuplicateLists(mergedArray);
        });
        return;
      }
      thisScope.disasters = List.query({type: 'disaster', name: search});
    }

    function getOffices (search) {
      if (thisScope.operationIds && thisScope.operationIds.length) {
        getMultipleLists(thisScope.operationIds, search, 'office').then(function(listsArray) {
          var mergedArray =  Array.prototype.concat.apply([], listsArray);
          thisScope.offices = removeDuplicateLists(mergedArray);
        });
        return;
      }
      thisScope.offices = List.query({type: 'office', name: search});
    }

    function getOperations (search) {
      thisScope.operations = List.query({type: 'operation', name: search});
    }

    function getOrganizations (search) {
      thisScope.organizations = List.query({type: 'organization', name: search});
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

      if (type === 'profiles') {
        filters.authOnly = false;
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

      if (filters.authOnly === 'false') {
        delete filters.authOnly;
        filters.user_type = 'profiles';
        return;
      }

      angular.forEach(thisScope.userTypes, function (userType) {
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
              thisScope.roles.push(list);
              populateCurrentFilter(value, type, thisScope.currentFilters.all);
              return;
            }
            $scope[typeLabel].push(list);
            populateCurrentFilter(value, type, thisScope.currentFilters.all);
          });
          return;
        }

        if (type === 'country') {
          getCountries('', function () {
            populateCurrentFilter(value, type, thisScope.currentFilters.all);
          });
        }

        if (type === 'organizations.orgTypeId') {
          filters[type] = parseInt(value, 10);
          populateCurrentFilter(value, type, thisScope.currentFilters.all);
        }

        if (type === 'user_type' || type === 'name' || type === 'q') {
          populateCurrentFilter(value, type, thisScope.currentFilters.all);
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
        selected = thisScope.countries.filter(function(item) {
          return item.id === value;
        })[0];
        if (!selected) {
          return;
        }
        label = selected.name;
      }

      if (type === 'organizations.orgTypeId') {
        selected = thisScope.orgTypes.filter(function(item) {
          return item.value === value ||  item.value === parseInt(value, 10);
        })[0];
        if (!selected) {
          return;
        }
        label = selected.label;
      }

      if (type === 'user_type') {
        selected = thisScope.userTypes.filter(function(item) {
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

      thisScope.currentFilters.all.push(item);
    }

    function populateCurrentFilters (filters) {
      thisScope.currentFilters.all = [];
      angular.forEach(filters, function (value, type) {
        populateCurrentFilter(value, type, thisScope.currentFilters.all);
      });
    }

    function filterUsers () {
      activeFilters = angular.copy(thisScope.selectedFilters);
      var formattedFilters = angular.copy(thisScope.selectedFilters);
      if (formattedFilters.user_type || formattedFilters.user_type === undefined) {
        formatUserTypes(formattedFilters);
      }

      if (formattedFilters.sort && formattedFilters.sort.indexOf('name') === -1) {
        formattedFilters.sort += ' name';
      }

      populateCurrentFilters(thisScope.selectedFilters);
      thisScope.usersLoaded = false;
      thisScope.pagination.currentPage = 1;
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
      thisScope.selectedFilters = {};
      activeFilters = {};
      filterUsers();
      thisScope.currentFilters.all = [];
    }

    function removeFilter (filter) {
      thisScope.currentFilters.all = thisScope.currentFilters.all.filter(function (item) {
        return item._id !== filter._id;
      });

      if (filter.type === 'name' && thisScope.selectedFilters.q) {
        delete thisScope.selectedFilters.q;
      }

      if (thisScope.selectedFilters[filter.type]) {
        if (filter.type === 'user_type') {

          if (filter._id === 'unverified') {
            delete thisScope.selectedFilters.verified;
          }

          if (thisScope.selectedFilters[filter._id]) {
            delete thisScope.selectedFilters[filter._id];
          }
        }

        delete thisScope.selectedFilters[filter.type];
      }
      filterUsers();
      // activeFilters = angular.copy(thisScope.selectedFilters);
      // $location.search(thisScope.selectedFilters);
    }

    function unFormatSortType (sortType) {
      var sortIndex = sortType.indexOf(' name');
      if (sortIndex !== -1) {
        return sortType.substr(0, sortIndex);
      }
    }

    function saveSearch (searchUser) {
      if (thisScope.list || !$routeParams.q && !$routeParams.name) {
        return;
      }
      SearchService.saveSearch(thisScope.currentUser, searchUser, 'user', function (user) {
        thisScope.setCurrentUser(user);
      });
    }

    function getList () {
      if (currentRequest['lists.list'] ||
        currentRequest['operations.list'] ||
        currentRequest['bundles.list'] ||
        currentRequest['organizations.list'] ||
        currentRequest['disasters.list'] ||
        currentRequest['functional_roles.list'] ||
        currentRequest['offices.list']) {
        var body = {};
        if (currentRequest['lists.list']) {
          return currentRequest['lists.list'];
        }
        if (currentRequest['operations.list']) {
          return currentRequest['operations.list'];
        }
        if (currentRequest['bundles.list']) {
          return currentRequest['bundles.list'];
        }
        if (currentRequest['organizations.list']) {
          return currentRequest['organizations.list'];
        }
        if (currentRequest['disasters.list']) {
          return currentRequest['disasters.list'];
        }
        if (currentRequest['functional_roles.list']) {
          return currentRequest['functional_roles.list'];
        }
        if (currentRequest['offices.list']) {
          return currentRequest['offices.list'];
        }
      }
    }

    $rootScope.$on('sidebar-closed', function () {
      thisScope.selectedFilters = angular.copy(activeFilters);
    });

    thisScope.$on('users-export-csv', function () {
      User.getCSVUrl(currentRequest, function (url) {
        var eventLabel = '';
        if (thisScope.list) {
          eventLabel = thisScope.list.name + '(' + thisScope.list._id + ')';
        }
        else {
          if (thisScope.currentFilters && thisScope.currentFilters.all) {
            thisScope.currentFilters.all.forEach(function (filter) {
              eventLabel += filter.label + ' ';
            });
          }
        }
        $window.ga('send', {
          hitType: 'event',
          eventCategory: 'CSV',
          eventAction: 'Download',
          eventLabel: eventLabel
        });
        $window.open(url);
      });
    });

    thisScope.$on('users-export-txt', function (evt, success, error) {
      User.exportTXT(currentRequest, success, error);
    });

    thisScope.$on('users-export-pdf', function (evt, format) {
      User.getPDFUrl(currentRequest, format, function (url) {
        var eventLabel = '';
        if (thisScope.list) {
          eventLabel = thisScope.list.name + '(' + thisScope.list._id + ')';
        }
        else {
          if (thisScope.currentFilters && thisScope.currentFilters.all) {
            thisScope.currentFilters.all.forEach(function (filter) {
              eventLabel += filter.label + ' ';
            });
          }
        }
        $window.ga('send', {
          hitType: 'event',
          eventCategory: 'PDF',
          eventAction: 'Download',
          eventLabel: eventLabel
        });
        $window.open(url);
      });
    });

    thisScope.$on('users-export-gss', function (evt) {
      var body = {};
      body.list = getList();
      if (body.list) {
        User.syncGSS(body)
          .then(function (resp) {
            var msg = gettextCatalog.getString('A synchronized Google Sheet was created. Find it at: ');
            msg += '<a href="https://docs.google.com/spreadsheets/d/' + resp.data.spreadsheet + '/edit" target="_blank">' + 'https://docs.google.com/spreadsheets/d/' + resp.data.spreadsheet + '/edit' + '</a>';
            alertService.pageAlert('success', msg);
          })
          .catch(function (err) {
            alertService.add('danger', gettextCatalog.getString('Sorry, the spreadsheet export did not work...'));
          });
      }
      else {
        alertService.add('danger', gettextCatalog.getString('You need to select a list'));
      }
    });

    thisScope.$on('users-export-outlook', function (evt) {
      var list = getList();
      if (list) {
        User.createOutlookGroup(list)
          .then(function (resp) {
            alertService.add('success', gettextCatalog.getString('The contact folder was successfully created.'));
          })
          .catch(function (err) {
            alertService.add('danger', gettextCatalog.getString('Sorry, the contact folder could not be created...'));
          });
      }
      else {
        alertService.add('danger', gettextCatalog.getString('You need to select a list'));
      }

    });

    function init () {
      UserDataService.subscribe($scope, function () {
        getUsers(currentRequest);
      });
    }

    init();

  }

})();
