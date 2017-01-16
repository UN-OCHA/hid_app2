(function() {
  'use strict';

  describe('Users controller', function () {

    var scope, mockhrinfoService, mockList, countries, listQueryResponse, roles, rootScope, mockUserService, mockGetText;

    countries = ['france', 'uk'];
    listQueryResponse = ['something'];

    var initialUsers = [
      {
        "_id": "1",
        "name": "Amy Benson",
      },
      {
        "_id": "2",
        "name": "Guillaume Viguier-Just",
      },
      {
        "_id": "3",
        "name": "Ignacio G Rebollo",
      }
    ];
    initialUsers.headers = {
      'x-total-count': 3
    }

    var filteredUsers = [
      {
        "_id": "2",
        "name": "Guillaume Viguier-Just",
      },
      {
        "_id": "3",
        "name": "Ignacio G Rebollo",
      }
    ];
    filteredUsers.headers = {
      'x-total-count': 2
    }
    var defaultParams = { limit: 50, offset: 0, sort: 'name' };
    var listParams = { limit: 50, offset: 0, sort: 'name', 'lists.list': '1234' };
    var searchParams = { limit: 50, offset: 0, sort: 'name', name: 'find' };

    beforeEach(function() {
      module('app.user');

      mockhrinfoService = {};
      module('app.common', function($provide) {
        $provide.value('hrinfoService', mockhrinfoService);
        $provide.value('alertService', {});
      });

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      mockUserService = {};
      module('app.user', function($provide) {
        $provide.value('UserDataService', mockUserService);
      });

      mockGetText = {};
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      module('app.user', function($provide) {
        $provide.constant('config', {});
      });

      inject(function($rootScope, $q) {
        scope = $rootScope.$new();

        mockhrinfoService.getCountries = function () {
          var defer = $q.defer();
          defer.resolve(countries);
          return defer.promise;
        }

        mockUserService.getUsers = function () {
          var defer = $q.defer();
          defer.resolve(initialUsers);
          return defer.promise;
        }

        mockList.query = function () {
          return listQueryResponse;
        }

        mockUserService.subscribe = function () {
          return;
        }

        spyOn(mockhrinfoService, 'getCountries').and.callThrough();
        // spyOn(mockhrinfoService, 'getRoles').and.callThrough();
        spyOn(mockList, 'query').and.callThrough();
        spyOn(mockUserService, 'getUsers').and.callThrough();
      });

    });

    function controllerSetup (list, search) {
      beforeEach (function () {
        inject(function($controller) {

          var ctrlParams = {
            $scope: scope,
            $routeParams: {}
          };
          var listInfo = undefined;
          if (list) {
            listInfo = []
            ctrlParams.$routeParams = {list: list};
            listInfo['lists.list'] = '1234';
          }

          if (search) {
            ctrlParams.$routeParams.q = 'find';
          }

          $controller('UsersCtrl', ctrlParams);

          scope.$broadcast('populate-list', listInfo);

          scope.$digest();
        });
      });
    }

    describe('Populating users', function () {
      controllerSetup()

      it('should get the users and add them to the scope', function () {
        expect(mockUserService.getUsers).toHaveBeenCalledWith(defaultParams);
        expect(scope.totalItems).toEqual(3);
        expect(scope.users).toEqual(initialUsers);
      });

    });

    describe('Populating users for a list', function () {
      controllerSetup('1234');

      it('should get the users for the list and add them to the scope', function () {
        expect(mockUserService.getUsers).toHaveBeenCalledWith(listParams);
        expect(scope.totalItems).toEqual(3);
        expect(scope.users).toEqual(initialUsers);
      });

    });

    describe('Searching for users', function () {
      controllerSetup(false, true);

      it('should get the users and add them to the scope', function () {
        expect(mockUserService.getUsers).toHaveBeenCalledWith(searchParams);
        expect(scope.totalItems).toEqual(3);
        expect(scope.users).toEqual(initialUsers);
      });

      it('should add the search term to the name field in the filters', function () {
        expect(scope.userFilters.name).toEqual('find');
        expect(scope.selectedFilters.name).toEqual('find');
      });
    });

    describe('Populating filters', function () {

      controllerSetup();

      it('should populate the countries dropdown', function () {
        expect(mockhrinfoService.getCountries).toHaveBeenCalled();
        expect(scope.countries).toEqual(countries);
      });

      it('should populate the roles dropdown', function () {
        expect(mockList.query).toHaveBeenCalledWith({'type': 'functional_role'}, jasmine.any(Function));
        expect(scope.roles).toEqual(listQueryResponse);
      });

      it('should populate the operations dropdown', function () {
        expect(mockList.query).toHaveBeenCalledWith({ type: 'operation' });
        expect(scope.operations).toEqual(listQueryResponse);
      });

    });

    describe('Populating filters on search', function () {
      controllerSetup();

      it('should search for groups', function () {
        scope.getBundles('find me');
        expect(mockList.query).toHaveBeenCalledWith({type: 'bundle', name: 'find me'});
        expect(scope.bundles).toEqual(listQueryResponse);
      });

      it('should search for disasters', function () {
        scope.getDisasters('find me');
        expect(mockList.query).toHaveBeenCalledWith({type: 'disaster', name: 'find me'});
        expect(scope.disasters).toEqual(listQueryResponse);
      });

      it('should search for disasters', function () {
        scope.getOrganizations('find me');
        expect(mockList.query).toHaveBeenCalledWith({type: 'organization', name: 'find me'});
        expect(scope.organizations).toEqual(listQueryResponse);
      });

    });

    describe('Filtering', function () {
      controllerSetup();

      it('should emit an event with the selected filters when the user filters', function () {
        scope.selectedFilters = {country: 'hrinfo_loc_416', sort: 'job_title'};
        scope.filter();
        expect(mockUserService.getUsers).toHaveBeenCalledWith({limit: 50, offset: 0, sort: 'job_title', country: 'hrinfo_loc_416'});
      });

    });

    describe('Clear filters', function () {
      controllerSetup();

      it('should clear the filters', function () {
        scope.users = filteredUsers;
        scope.totalItems = 2;
        scope.userFilters = {country: 'hrinfo_loc_416', sort: 'type'};
        scope.selectedFilters = {country: 'hrinfo_loc_416', sort: 'type'};
        scope.resetFilters();
        scope.$digest();

        expect(scope.userFilters).toEqual({});
        expect(scope.selectedFilters).toEqual({});
        expect(scope.currentPage).toEqual(1);
        expect(scope.totalItems).toEqual(3);
        expect(scope.users).toEqual(initialUsers);
      });

    });

    describe('Set showAdmin variable for use in a class name', function () {

      describe('When viewing users in a list', function () {
        controllerSetup('1234')
        it('should set showAdmin to true', function () {
          expect(scope.showAdmin).toBe(true)
        });
      });

      describe('When viewing users not in a list', function () {
        controllerSetup()
        it('should set showAdmin to false', function () {
          expect(scope.showAdmin).toBe(false)
        });
      });

    });

  });
})();

