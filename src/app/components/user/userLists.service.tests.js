(function() {
  'use strict';

  describe('User Lists service', function () {

    var $localForage, $rootScope, expectedFavouriteLists, expectedListsMember, List, ListDataService,
    listFixture, mockConfig, mockLf, mockList, mockList1, mockListDataService, mockLocalForage, mockOwnedManagedLists, mockReturnedList,
    userFixture, UserListsService;

    beforeEach(function () {
      userFixture = readJSON('app/test-fixtures/user.json');
      userFixture.user1.organizations = [];
      listFixture = readJSON('app/test-fixtures/list.json');
      mockConfig = {};
      mockConfig.listTypes = ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office'];
      mockList = {};
      mockList.get = function () {};
      mockList.cache = function () {};
      mockReturnedList = {};
      mockListDataService = {};
      mockList1 = listFixture.lists[5];
      mockOwnedManagedLists = [mockList1];

      expectedFavouriteLists = [
        {
          _id: userFixture.user1.favoriteLists[0]._id,
          cacheStatus: 'caching'
        },
        {
          _id: userFixture.user1.favoriteLists[1]._id,
          cacheStatus: 'caching'
        }
      ];

      expectedListsMember = [
        {
          _id: userFixture.user1.lists[0].list,
          checkinId: userFixture.user1.lists[0]._id,
          name: userFixture.user1.lists[0].name,
          type: 'list',
          cacheStatus: 'caching'
        },
        {
          _id: userFixture.user1.lists[1].list,
          checkinId: userFixture.user1.lists[1]._id,
          name: userFixture.user1.lists[1].name,
          type: 'list',
          cacheStatus: 'caching'
        }
      ];

      mockLocalForage = {
        instance: function () {}
      };

      module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.constant('$localForage', mockLocalForage);
      });

      module('app.list', function($provide) {
        $provide.constant('List', mockList);
        $provide.constant('ListDataService', mockListDataService);
      });

      mockListDataService.getManagedAndOwnedLists = function () {};

      inject(function(_UserListsService_, _List_, config, $q, _$rootScope_) {
        $rootScope = _$rootScope_;
        UserListsService = _UserListsService_;
        List = mockList;
        config = mockConfig;
        $localForage = mockLocalForage;
        ListDataService = mockListDataService;

        mockLf = {
          setItem: function () {}
        };
        spyOn(mockLf, 'setItem').and.returnValue($q.when());

        mockReturnedList.cache = function() {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        };

        mockList1.cache = function() {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        };


        spyOn(mockLocalForage, 'instance').and.returnValue(mockLf);

        spyOn(mockReturnedList, 'cache').and.callThrough();
        spyOn(mockList1, 'cache').and.callThrough();
        spyOn(mockList, 'get').and.returnValue(
          {$promise: $q.when(mockReturnedList)}
        );
        spyOn(mockListDataService, 'getManagedAndOwnedLists').and.callFake(function(arg1, arg2, callback) {
          callback(mockOwnedManagedLists);
        });
      });

    });

    describe('Cache user lists', function () {

      beforeEach(function () {
        UserListsService.cacheListsForUser(userFixture.user1);
      });

      it('should store the cached at date', function () {
        expect(mockLf.setItem).toHaveBeenCalledWith('cachedAt', jasmine.any(Date));
      });

      describe('Favourite lists', function () {

        it('should get the favourite lists', function () {
          expect(mockList.get).toHaveBeenCalledWith({listId: 'fav-1'});
          expect(mockList.get).toHaveBeenCalledWith({listId: 'fav-2'});
        });

        it('should cache the favourite lists', function () {
          $rootScope.$digest();
          expect(mockReturnedList.cache).toHaveBeenCalled();
          expect(mockReturnedList.cache.calls.count()).toEqual(4);
        });

        it('should store that the list has been cached', function () {
          expect(UserListsService.cachedLists).toContain({_id: userFixture.user1.favoriteLists[0]._id, status: 'caching'});
          expect(UserListsService.cachedLists).toContain({_id: userFixture.user1.favoriteLists[1]._id, status: 'caching'});
        });

      });

      describe('Lists the user is a member of', function () {

        it('should get the lists', function () {
          expect(mockList.get).toHaveBeenCalledWith({listId: 'list-1-id'});
          expect(mockList.get).toHaveBeenCalledWith({listId: 'list-2-id'});
        });

        it('should cache the lists', function () {
          $rootScope.$digest();
          expect(mockReturnedList.cache).toHaveBeenCalled();
          expect(mockReturnedList.cache.calls.count()).toEqual(4);
        });

        it('should store that the list has been cached', function () {
          expect(UserListsService.cachedLists).toContain({_id: userFixture.user1.lists[0].list, status: 'caching'});
          expect(UserListsService.cachedLists).toContain({_id: userFixture.user1.lists[1].list, status: 'caching'});
        });

      });

      describe('Lists the user is manages and owns', function () {

        it('should get the lists', function () {
          expect(mockListDataService.getManagedAndOwnedLists).toHaveBeenCalledWith(userFixture.user1, '', jasmine.any(Function));
        });

        it('should cache the lists', function () {
          $rootScope.$digest();
          expect(mockList1.cache).toHaveBeenCalled();
        });

        it('should store that the list has been cached', function () {
          expect(UserListsService.cachedLists).toContain({_id: listFixture.lists[0]._id, status: 'caching'});
        });

      });

    });

    describe('Get user lists', function () {

      beforeEach(function () {
        UserListsService.cachedLists = [{_id: userFixture.user1.favoriteLists[0]._id, status: 'cached'}];
        UserListsService.getListsForUser(userFixture.user1);
      });

      describe('Get favourite lists', function () {

        it('should update the cache status and store the lists', function () {
          expect(UserListsService.favoriteLists[0]).toEqual({_id: userFixture.user1.favoriteLists[0]._id, cacheStatus: 'cached'});
        });

        describe('cache un-cached lists', function () {

          it('should get the list', function () {
            expect(mockList.get).toHaveBeenCalledWith({listId: 'fav-2'});
          });

          it('should cache the list', function () {
            $rootScope.$digest();
            expect(mockReturnedList.cache).toHaveBeenCalled();
          });

          it('should update the cached status on the stored list', function () {
            $rootScope.$digest();
            expect(UserListsService.favoriteLists[1]).toEqual({_id: userFixture.user1.favoriteLists[1]._id, cacheStatus: 'caching'});
          });

        });
      });

      describe('Lists the user is a member of', function () {

        it('should update the cache status and store the lists', function () {
          expect(UserListsService.listsMember[0]).toEqual(expectedListsMember[0]);
        });

        describe('cache un-cached lists', function () {

          it('should get the list', function () {
            expect(mockList.get).toHaveBeenCalledWith({listId: userFixture.user1.lists[0].list});
          });

          it('should cache the list', function () {
            $rootScope.$digest();
            expect(mockReturnedList.cache).toHaveBeenCalled();
          });

          it('should update the cached status on the stored list', function () {
            $rootScope.$digest();
            expect(UserListsService.listsMember[1]).toEqual(expectedListsMember[1]);
          });

        });

      });

      describe('Lists the user is manages and owns', function () {

        it('should get the lists', function () {
          expect(mockListDataService.getManagedAndOwnedLists).toHaveBeenCalledWith(userFixture.user1, '', jasmine.any(Function));
        });

        it('should update the cache status for the lists and store on the service', function () {
          expect(UserListsService.listsOwnedAndManaged[0]._id).toEqual(listFixture.lists[5]._id);
          expect(UserListsService.listsOwnedAndManaged[0].name).toEqual(listFixture.lists[5].name);
          expect(UserListsService.listsOwnedAndManaged[0].cacheStatus).toEqual('caching');
        });

        describe('cache un-cached lists', function () {

          it('should cache the lists', function () {
            $rootScope.$digest();
            expect(mockList1.cache).toHaveBeenCalled();
          });

          it('should update the cached status on the stored list', function () {
            $rootScope.$digest();
            expect(UserListsService.listsOwnedAndManaged[0].cacheStatus).toEqual('success');
          });

        });

      });

    });

  });

 })();
