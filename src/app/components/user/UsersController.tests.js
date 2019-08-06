(function() {
  'use strict';

  describe('UsersController', function () {

    var adminDefaultParams, countries, defaultParams, filterParams, filterRouteParams, initialUsers, listFixture, listInfo, listParams, listQueryResponse,
    mockGetText, mockAlertService, mockhrinfoService, mockList, mockLocation, mockSearchService, mockSidebarService, mockUser,
    mockUserDataService, scope, userFixture;

    listFixture = readJSON('app/test-fixtures/list.json');

    beforeEach(function() {
      module('app.user');

      defaultParams = { limit: 50, offset: 0, sort: 'name', authOnly: false };
      adminDefaultParams = { limit: 50, offset: 0, sort: 'name'};
      listParams = { limit: 50, offset: 0, sort: 'name', 'lists.list': '1234', authOnly: false };
      filterRouteParams = {
        'organizations.orgTypeId': '437',
        'organizations.list': '58b44a313d0ba000db413996'
      };

      userFixture = readJSON('app/test-fixtures/user.json');

      initialUsers = [userFixture.user1, userFixture.user2, userFixture.adminUser];
      countries = [{id: '1', name: 'france'}, {id: 2, name: 'uk'}, {id: 'country-id', name: 'pick me!'}];
      listQueryResponse = listFixture.lists[0];

      mockUserDataService = {};
      mockUserDataService.subscribe = function () {};

      mockUser =  {
        getCSVUrl: function () {},
        exportTXT:function () {},
        getPDFUrl: function () {}
      };

      mockLocation = {
        search: function () {}
      };
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
        $provide.value('UserDataService', mockUserDataService);
        $provide.value('$location', mockLocation);
      });
      spyOn(mockUser, 'getCSVUrl');
      spyOn(mockUser, 'exportTXT');
      spyOn(mockUser, 'getPDFUrl');
      spyOn(mockUserDataService, 'subscribe').and.callThrough();

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      mockGetText = {};
      mockGetText.getString = function (str) {
        return str;
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockAlertService = {
      	add: function () {}
      };
      spyOn(mockAlertService, 'add').and.callFake(function(arg1, arg2, arg3, callback) {
        if (callback) {
          callback();
        }
      });
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockSidebarService = {
        close: function () {}
      };
      module('app.sidebar', function($provide) {
        $provide.value('SidebarService', mockSidebarService);
      });
      spyOn(mockSidebarService, 'close').and.callThrough();

      mockSearchService = {
        saveSearch: function () {}
      };
      module('app.search', function($provide) {
        $provide.value('SearchService', mockSearchService);
      });
      spyOn(mockSearchService, 'saveSearch');

      mockhrinfoService = {};
      module('app.common', function($provide) {
        $provide.value('hrinfoService', mockhrinfoService);
      });

      mockUserDataService.getUsers = function () {};
      mockUserDataService.listUsers = initialUsers;
      mockUserDataService.listUsersTotal = 3;

      spyOn(mockUserDataService, 'getUsers').and.callFake(function(arg1, arg2, callback){
        callback();
      });

    });

    function controllerSetup (listId, filters, userType) {
      beforeEach (function () {
        inject(function($controller, $rootScope, $q) {
          scope = $rootScope.$new();
          scope.currentUser = {_id:1};

          if (userType === 'admin') {
            scope.currentUser.is_admin = true;
          }
          if (userType === 'manager') {
            scope.currentUser.isManager = true;
          }

          var ctrlParams = {
            $scope: scope,
            $routeParams: {}
          };
          listInfo = undefined;

          mockList.query = function () {};
          spyOn(mockList, 'query').and.callFake(function (params) {
            if (params['metadata.operation.id'] === 1) {
              return {$promise: $q.when([listFixture.lists[0]])};
            }
            if (params['metadata.operation.id'] === 2) {
              return {$promise: $q.when([listFixture.lists[0], listFixture.lists[2]])};
            }
            return listQueryResponse;
          });

          mockList.get = function () {};
          spyOn(mockList, 'get').and.callFake(function (params, callback) {
            return callback(listFixture.lists[0]);
          });

          if (listId) {
            scope.list = function () {};
            mockList.associatedOperations = function () {
              return [1,2];
            };
            scope.list = mockList;

            spyOn(mockList, 'associatedOperations').and.callThrough();

            listInfo = [];
            ctrlParams.$routeParams.list = listId;
            listInfo['lists.list'] = listId;
          }

          if (filters) {
            ctrlParams.$routeParams = filters;
          }

          spyOn(mockLocation, 'search').and.returnValue({});

          mockhrinfoService.getCountries = function () {
            var defer = $q.defer();
            defer.resolve(countries);
            return defer.promise;
          };
          spyOn(mockhrinfoService, 'getCountries').and.callThrough();

          $controller('UsersController', ctrlParams);

          scope.$broadcast('populate-list', listInfo);

          scope.$digest();
        });
      });
    }

    describe('All users', function () {
      controllerSetup();

      describe('Get initial users', function () {

        it('should subscribe to the user data service', function () {
          expect(mockUserDataService.subscribe).toHaveBeenCalled();
        });

        it('should get the first 50 users', function () {
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(defaultParams, undefined, jasmine.any(Function));
        });

        it('should add the users to the scope', function () {
         expect(scope.users).toEqual(initialUsers);
       });

        it('should update the total users', function () {
          expect(scope.totalItems).toEqual(3);
        });

        it('should hide the loader', function () {
          expect(scope.usersLoaded).toBe(true);
        });

      });

      describe('Paginating users', function () {

        it('should get the second page of users', function () {
          defaultParams.offset = 50;
          scope.pagination.currentPage = 2;
          scope.pageChanged();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(defaultParams, undefined, jasmine.any(Function));
        });

      });

      describe('Changing the number of users to show per page', function () {

        it('should show more users per page', function () {
          defaultParams.limit = 100;
          scope.setLimit(100);
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(defaultParams, undefined, jasmine.any(Function));
        });


      });

    });

    describe('Viewing Auth users', function () {

      describe('as a standard user', function () {

        controllerSetup();

        it('should not request auth users', function () {
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(defaultParams, undefined, jasmine.any(Function));
        });

      });

      describe('as an admin user', function () {

        controllerSetup(null, null, 'admin');

        it('should request auth users', function () {
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(adminDefaultParams, undefined, jasmine.any(Function));
        });

      });

      describe('as a global manager', function () {

        controllerSetup(null, null, 'manager');

        it('should request auth users', function () {
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(adminDefaultParams, undefined, jasmine.any(Function));
        });

      });

    });

    describe('List users', function () {

      controllerSetup('1234');

      describe('Get initial users', function () {

        it('should subscribe to the user data service', function () {
          expect(mockUserDataService.subscribe).toHaveBeenCalled();
        });

        it('should get the first 50 users for the list', function () {
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(listParams, mockList, jasmine.any(Function));
        });

        it('should add the users to the scope', function () {
         expect(scope.users).toEqual(initialUsers);
       });

        it('should update the total users', function () {
          expect(scope.totalItems).toEqual(3);
        });

        it('should hide the loader', function () {
          expect(scope.usersLoaded).toBe(true);
        });

      });

      describe('Get operations associated with the list', function () {

        it('should get the associated operations', function () {
          expect(mockList.associatedOperations).toHaveBeenCalled();
        });

      });

      describe('Changing the number of users to show per page', function () {

        it('should show more users per page', function () {
          listParams.limit = 100;
          scope.setLimit(100);
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(listParams, mockList, jasmine.any(Function));
        });

      });

    });

    describe('Populating filters on search', function () {
      controllerSetup(false);

      it('should search for countries', function () {
        scope.getCountries('find me');
        scope.$digest();
        expect(mockhrinfoService.getCountries).toHaveBeenCalledWith({name: 'find me'});
        expect(scope.countries).toEqual(countries);
      });

      it('should search for roles', function () {
        scope.getRoles('find me');
        scope.$digest();
        expect(mockList.query).toHaveBeenCalledWith({'type': 'functional_role', name: 'find me'});
        expect(scope.roles).toEqual(listQueryResponse);
      });

      it('should search for operations', function () {
        scope.getOperations('find me');
        scope.$digest();
        expect(mockList.query).toHaveBeenCalledWith({ type: 'operation', name: 'find me'});
        expect(scope.operations).toEqual(listQueryResponse);
      });

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

      it('should search for organizations', function () {
        scope.getOrganizations('find me');
        expect(mockList.query).toHaveBeenCalledWith({type: 'organization', name: 'find me'});
        expect(scope.organizations).toEqual(listQueryResponse);
      });

      it('should search for offices', function () {
        scope.getOffices('find me');
        expect(mockList.query).toHaveBeenCalledWith({type: 'office', name: 'find me'});
        expect(scope.offices).toEqual(listQueryResponse);
      });

    });

    describe('Populating filters based on associated operations', function () {
      controllerSetup(true);

      it('should search for groups associated with the operation', function () {
        scope.getBundles('find bundles');
        expect(mockList.query).toHaveBeenCalledWith({type: 'bundle', name: 'find bundles', 'metadata.operation.id': 1});
        expect(mockList.query).toHaveBeenCalledWith({type: 'bundle', name: 'find bundles', 'metadata.operation.id': 2});
      });

      it('should remove duplicate groups associated with the operation and add the groups to the scope', function () {
        scope.getBundles('find bundles');
        scope.$digest();
        expect(scope.bundles).toEqual([listFixture.lists[0], listFixture.lists[2]]);
      });

      it('should search for disasters associated with the operation', function () {
        scope.getDisasters('find disasters');
        expect(mockList.query).toHaveBeenCalledWith({type: 'disaster', name: 'find disasters', 'metadata.operation.id': 1});
        expect(mockList.query).toHaveBeenCalledWith({type: 'disaster', name: 'find disasters', 'metadata.operation.id': 2});
      });

      it('should remove duplicate disasters associated with the operation and add the disasters to the scope', function () {
        scope.getDisasters('find disasters');
        scope.$digest();
        expect(scope.disasters).toEqual([listFixture.lists[0], listFixture.lists[2]]);
      });

      it('should search for offices associated with the operation', function () {
        scope.getOffices('find offices');
        expect(mockList.query).toHaveBeenCalledWith({type: 'office', name: 'find offices', 'metadata.operation.id': 1});
        expect(mockList.query).toHaveBeenCalledWith({type: 'office', name: 'find offices', 'metadata.operation.id': 2});
      });

      it('should remove duplicate offices associated with the operation and add the offices to the scope', function () {
        scope.getOffices('find offices');
        scope.$digest();
        expect(scope.offices).toEqual([listFixture.lists[0], listFixture.lists[2]]);
      });

    });

    describe('Filtering', function () {
      controllerSetup();

      it('should get users with the filters', function () {
        filterParams = defaultParams;
        filterParams['organizations.orgTypeId'] = 435;
        scope.selectedFilters = {'organizations.orgTypeId': 435};
        scope.applyFilters();
        expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
      });

      it('should update the query string with the filters', function () {
        scope.selectedFilters = {'organizations.orgTypeId': 435};
        scope.applyFilters();
        expect(mockLocation.search).toHaveBeenCalledWith(scope.selectedFilters);
      });

      it('should reset the pagination when filtered', function () {
        scope.pagination.currentPage = 5;
        filterParams = defaultParams;
        filterParams['organizations.orgTypeId'] = 435;
        scope.applyFilters();
        expect(scope.pagination.currentPage).toEqual(1);
      });

      it('should get the second page of filtered users', function () {
        scope.selectedFilters = {'organizations.orgTypeId': 435};
        filterParams = defaultParams;
        filterParams['organizations.orgTypeId'] = 435;
        scope.applyFilters();

        filterParams.offset = 50;
        scope.pagination.currentPage = 2;
        scope.pageChanged();
        expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));

        filterParams.offset = 100;
        scope.pagination.currentPage = 3;
        scope.pageChanged();
        expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
      });

      describe('Formatting user type for filtering', function () {

        it('should format the is orphan user type', function () {
          scope.selectedFilters = {user_type: 'is_orphan'};
          filterParams = defaultParams;
          filterParams.is_orphan = true;
          scope.applyFilters();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
        });

        it('should format the is ghost user type', function () {
          scope.selectedFilters = {user_type: 'is_ghost'};
          filterParams = defaultParams;
          filterParams.is_ghost = true;
          scope.applyFilters();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
        });

        it('should format the is admin user type', function () {
          scope.selectedFilters = {user_type: 'is_admin'};
          filterParams = defaultParams;
          filterParams.is_admin = true;
          scope.applyFilters();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
        });

        it('should format the verified user type', function () {
          scope.selectedFilters = {user_type: 'verified'};
          filterParams = defaultParams;
          filterParams.verified = true;
          scope.applyFilters();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
        });

        it('should format the unverified user type', function () {
          scope.selectedFilters = {user_type: 'unverified'};
          filterParams = defaultParams;
          filterParams.verified = false;
          scope.applyFilters();
          expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
        });

      });

      describe('Populate current filters', function () {

        it ('should add the searched for name to the current filters', function () {
          scope.selectedFilters = {name: 'perkins'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'perkins', label: 'perkins', type: 'name'}]);
        });

        it ('should add selected disaster to current filters', function () {
          scope.disasters = [{_id: 'disasters-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'disasters.list': 'disasters-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'disasters-id', label: 'pick me!', type: 'disasters.list'}]);
        });

        it ('should add selected country to current filters', function () {
          scope.countries = [{id: 'country-id', name: 'pick me!'}, {id: '6969', name: 'not me'}];
          scope.selectedFilters = {'country': 'country-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'country-id', label: 'pick me!', type: 'country'}]);
        });

        it ('should add selected office (co-ordination hub) to current filters', function () {
          scope.offices = [{_id: 'offices-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'offices.list': 'offices-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'offices-id', label: 'pick me!', type: 'offices.list'}]);
        });

        it ('should add selected bundle (group/cluster) to current filters', function () {
          scope.bundles = [{_id: 'bundles-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'bundles.list': 'bundles-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'bundles-id', label: 'pick me!', type: 'bundles.list'}]);
        });

        it ('should add selected organization type to current filters', function () {
          scope.selectedFilters = {'organizations.orgTypeId': 433};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 433, label: 'Donor', type: 'organizations.orgTypeId'}]);
        });

        it ('should add selected organization to current filters', function () {
          scope.organizations = [{_id: 'organizations-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'organizations.list': 'organizations-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'organizations-id', label: 'pick me!', type: 'organizations.list'}]);
        });

        it ('should add selected role to current filters', function () {
          scope.roles = [{_id: 'roles-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'functional_roles.list': 'roles-id'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'roles-id', label: 'pick me!', type: 'functional_roles.list'}]);
        });


        it ('should add selected user type to current filters', function () {
          scope.selectedFilters = {'user_type': 'is_ghost'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([{_id: 'is_ghost', label: 'Ghost', type: 'user_type'}]);
        });

        it ('should add multiple filters at once to the current filters', function () {
          scope.organizations = [{_id: 'organizations-id', name: 'pick me!'}, {_id: '6969', label: 'not me'}];
          scope.selectedFilters = {'organizations.orgTypeId': 433, 'organizations.list': 'organizations-id', 'user_type': 'is_ghost'};
          scope.applyFilters();
          expect(scope.currentFilters.all).toEqual([
            {_id: 433, label: 'Donor', type: 'organizations.orgTypeId'},
            {_id: 'organizations-id', label: 'pick me!', type: 'organizations.list'},
            {_id: 'is_ghost', label: 'Ghost', type: 'user_type'}
            ]);
        });

      });

describe('Close sidebar when filter', function () {
  it('should close the sidebar when apply filters', function () {
    scope.applyFilters();
    expect(mockSidebarService.close).toHaveBeenCalled();
  });
});

});

describe('Getting the filters from the query string', function () {

  describe('Update selected filters', function () {

    controllerSetup(false, {'organizations.list': '58b44a313d0ba000db413996'});

    it('should set the selected filters', function () {
      expect(scope.selectedFilters).toEqual({'organizations.list': '58b44a313d0ba000db413996'});
    });
  });

  describe('Re-formatting filtered user types', function () {

    describe('Orphan user type', function () {
      controllerSetup(false, {is_orphan: true});
      it('should format the is orphan user type', function () {
        expect(scope.selectedFilters).toEqual({user_type: 'is_orphan'});
      });
    });

    describe('is_ghost user type', function () {
      controllerSetup(false, {is_ghost: true});
      it('should format the is ghost user type', function () {
        expect(scope.selectedFilters).toEqual({user_type: 'is_ghost'});
      });
    });

    describe('is_admin user type', function () {
      controllerSetup(false, {is_admin: true});
      it('should format the is admin user type', function () {
        expect(scope.selectedFilters).toEqual({user_type: 'is_admin'});
      });
    });

    describe('verified user type', function () {
      controllerSetup(false, {verified: true});
      it('should format the is verified user type', function () {
        expect(scope.selectedFilters).toEqual({user_type: 'verified'});
      });
    });

    describe('unverified user type', function () {
      controllerSetup(false, {verified: 'false'});
      it('should format the is unverified user type', function () {
        expect(scope.selectedFilters).toEqual({user_type: 'unverified'});
      });
    });

  });

  describe('Repopulating the filters so users can see what they are filtering on', function () {

    describe('Name filter', function () {
      controllerSetup(false, {'name': 'perkins'});

      it('should populate the name current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: 'perkins', label: 'perkins', type: 'name'}]);
      });
    });

    describe('Name filter from search', function () {
      controllerSetup(false, {'q': 'perkins'});

      it('should populate the name current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: 'perkins', label: 'perkins', type: 'name'}]);
      });
    });

    describe('Disaster filter', function () {
      controllerSetup(false, {'disasters.list': listFixture.lists[0]._id});

      it('should populate the disaster filter', function () {
        expect(mockList.get).toHaveBeenCalledWith({listId: listFixture.lists[0]._id}, jasmine.any(Function));
        expect(scope.disasters).toEqual([listFixture.lists[0]]);
      });

      it('should populate the disaster current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: listFixture.lists[0]._id, label: listFixture.lists[0].name, type: 'disasters.list'}]);
      });

    });

    describe('country filter', function () {
      controllerSetup(false, {'country': 'country-id'});

      it('should populate the country filter', function () {
        scope.$digest();
        expect(mockhrinfoService.getCountries).toHaveBeenCalled();
        expect(scope.countries).toEqual(countries);
      });

      it('should populate the country current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: 'country-id', label: 'pick me!', type: 'country'}]);
      });
    });

    describe('office filter', function () {
      controllerSetup(false, {'offices.list': listFixture.lists[0]._id});

      it('should populate the office (co-ordination hub) filter', function () {
        expect(mockList.get).toHaveBeenCalledWith({listId: listFixture.lists[0]._id}, jasmine.any(Function));
        expect(scope.offices).toEqual([listFixture.lists[0]]);
      });

      it('should populate the office (co-ordination hub) current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: listFixture.lists[0]._id, label: listFixture.lists[0].name, type: 'offices.list'}]);
      });
    });

    describe('bundle filter', function () {
      controllerSetup(false, {'bundles.list': listFixture.lists[0]._id});

      it('should populate the bundle (group/cluster) filter', function () {
        expect(mockList.get).toHaveBeenCalledWith({listId: listFixture.lists[0]._id}, jasmine.any(Function));
        expect(scope.bundles).toEqual([listFixture.lists[0]]);
      });

      it('should populate the bundle (group/cluster) current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: listFixture.lists[0]._id, label: listFixture.lists[0].name, type: 'bundles.list'}]);
      });
    });

    describe('organization type filter', function () {
      controllerSetup(false, {'organizations.orgTypeId': 433});

      it('should populate the organization type filter', function () {
        expect(scope.selectedFilters['organizations.orgTypeId']).toEqual(433);
      });

      it('should populate the organization type current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: 433, label: 'Donor', type: 'organizations.orgTypeId'}]);
      });
    });

    describe('organization filter', function () {
     controllerSetup(false, {'organizations.list': listFixture.lists[0]._id});
     it('should populate the organization filter', function () {
      expect(mockList.get).toHaveBeenCalledWith({listId: listFixture.lists[0]._id}, jasmine.any(Function));
      expect(scope.organizations).toEqual([listFixture.lists[0]]);
    });

     it('should populate the organization current filter', function () {
      expect(scope.currentFilters.all).toEqual([{_id: listFixture.lists[0]._id, label: listFixture.lists[0].name, type: 'organizations.list'}]);
    });
   });

    describe('role filter', function () {
      controllerSetup(false, {'functional_roles.list': listFixture.lists[0]._id});
      it('should populate the role filter', function () {
        expect(mockList.get).toHaveBeenCalledWith({listId: listFixture.lists[0]._id}, jasmine.any(Function));
        expect(scope.roles).toEqual([listFixture.lists[0]]);
      });

      it('should populate the role current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: listFixture.lists[0]._id, label: listFixture.lists[0].name, type: 'functional_roles.list'}]);
      });
    });

    describe('user type filter', function () {
      controllerSetup(false, {'user_type': 'is_ghost'});

      it('should populate the user type filter', function () {
        expect(scope.selectedFilters.user_type).toEqual('is_ghost');
      });

      it('should populate the user type current filter', function () {
        expect(scope.currentFilters.all).toEqual([{_id: 'is_ghost', label: 'Ghost', type: 'user_type'}]);
      });
    });

  });

});

describe ('Reset all filters', function () {

  controllerSetup(false);

  it ('should reset all the filters', function () {
    scope.selectedFilters = {'organizations.orgTypeId': 433, 'organizations.list': 'organizations-id', 'user_type': 'is_ghost'};
    scope.currentFilters = [
    {_id: 433, label: 'Donor', type: 'organizations.orgTypeId'},
    {_id: 'organizations-id', label: 'pick me!', type: 'organizations.list'},
    {_id: 'is_ghost', label: 'Ghost', type: 'user_type'}
    ];
    scope.resetFilters();
    expect(scope.selectedFilters).toEqual({});
    expect(scope.currentFilters.all).toEqual([]);
  });

});

describe ('Remove individual filters', function () {

  controllerSetup(false);

  it('should remove the filter', function () {

    scope.selectedFilters = {'organizations.orgTypeId': 433, 'organizations.list': 'organizations-id', 'user_type': 'is_ghost'};
    scope.currentFilters.all = [
    {_id: 433, label: 'Donor', type: 'organizations.orgTypeId'},
    {_id: 'organizations-id', label: 'pick me!', type: 'organizations.list'},
    {_id: 'is_ghost', label: 'Ghost', type: 'user_type'}
    ];

    scope.currentFilters.remove({_id: 'organizations-id', label: 'pick me!', type: 'organizations.list'});
    expect(scope.selectedFilters).toEqual({'organizations.orgTypeId': 433, 'user_type': 'is_ghost'});
    expect(scope.currentFilters.all).toEqual([{_id: 433, label: 'Donor', type: 'organizations.orgTypeId'}, {_id: 'is_ghost', label: 'Ghost', type: 'user_type'}]);
    expect(mockLocation.search).toHaveBeenCalledWith({'organizations.orgTypeId': 433, 'is_ghost': true});
  });

});

describe ('Always have name as sort parameter', function () {

  describe('when sort', function () {
    controllerSetup();
    it ('should add name to the sort parameter', function () {
      scope.selectedFilters = {sort: 'verified'};
      scope.applyFilters();
      expect(mockLocation.search).toHaveBeenCalledWith({sort: 'verified name'});
    });
  });
  describe('when filtering from query string', function () {
    controllerSetup(false, {'user_type': 'is_ghost', sort: 'verified name'});
    it ('should repopulate the sort field when filtering from query string', function () {
      scope.$digest();
      expect(scope.selectedFilters.sort).toEqual('verified');
    });
  });
});

describe ('Searching all users by name', function () {
  controllerSetup(false, {q: 'perkins'});
  it ('should add the search term to the filters', function () {
    filterParams = defaultParams;
    filterParams.q = 'perkins';

    expect(mockUserDataService.getUsers).toHaveBeenCalledWith(filterParams, undefined, jasmine.any(Function));
  });

});

describe ('Saving searched for user', function () {
  controllerSetup(false, {q: 'perkins'});
  it('should save the user', function () {
    // scope.currentUser = {_id:1};/
    scope.saveSearch({_id:2});
    expect(mockSearchService.saveSearch).toHaveBeenCalledWith({_id:1}, {_id:2}, 'user', jasmine.any(Function));
  });
});

describe ('Exporting users', function () {
  controllerSetup('123', {name: 'perkins', verified: true});

  it ('should export the users to csv', function () {
    filterParams = defaultParams;
    filterParams['lists.list'] = '123';
    filterParams.name = 'perkins';
    filterParams.verified = true;
    scope.$emit('users-export-csv');
    expect(mockUser.getCSVUrl).toHaveBeenCalledWith(filterParams);
  });

  it ('should export the users to txt', function () {
    filterParams = defaultParams;
    filterParams['lists.list'] = '123';
    filterParams.name = 'perkins';
    filterParams.verified = true;
    scope.$emit('users-export-txt', jasmine.any(Function), jasmine.any(Function));
    expect(mockUser.exportTXT).toHaveBeenCalledWith(filterParams, jasmine.any(Function), jasmine.any(Function));
  });

  it ('should export the users to pdf', function () {
    filterParams = defaultParams;
    filterParams['lists.list'] = '123';
    filterParams.name = 'perkins';
    filterParams.verified = true;
    scope.$emit('users-export-pdf',jasmine.any(Function));
    expect(mockUser.getPDFUrl).toHaveBeenCalledWith(filterParams, jasmine.any(Function));
  });
});

});
})();
