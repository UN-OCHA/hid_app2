(function() {
  'use strict';

  describe('Check-in controller', function () {

    var countries, currentUserId, differentUserId, list1, list2, list3, list4, listQueryResponse, scope, mockhrinfoService,
    mockList, mockUser, mockGetText, mockConfig, testUser;

    countries = ['france', 'uk'];
    currentUserId = '1234';
    differentUserId = '4321';
    list1 = {_id: 1, name: 'My list'};
    list2 = {_id: 2, name: 'Another', type: 'operation'};
    list3 = {_id: 3, name: 'Words'};
    list4 = {_id: 4, name: 'Guitars'};

    listQueryResponse = [list1, list2, list3, list4];

    function ctrlSetup (isCurrentUser) {
      inject(function($controller, $rootScope, $q, $injector) {
        scope = $rootScope.$new();

        testUser = $injector.get('User');
        testUser._id = isCurrentUser ? currentUserId : differentUserId;
        testUser.organization = [];
        testUser.emails = [{id: 1, email: 'xx@xx.com', type: 'Work'}];
        testUser.location = {
          country: {
            name: 'UK'
          },
          region: {
            name: 'SoYo'
          }
        };
        testUser.addPhone = function () {
          return;
        };
        testUser.setPrimaryPhone = function () {
          return;
        };
        testUser.addEmail = function () {
          return;
        };
        testUser.setPrimaryEmail = function () {
          return;
        };
        testUser.$update = function () {
          return;
        };
        testUser.get = function () {
          return;
        };

        scope.currentUser = {
          _id: currentUserId
        };
        scope.editPhoneForm = {};
        scope.editEmailForm = {};
        scope.editLocationForm = {};

        mockhrinfoService.getCountries = function () {
          var defer = $q.defer();
          defer.resolve(countries);
          return defer.promise;
        };

        mockList.query = function () {
          return;
        };

        spyOn(mockList, 'query').and.callFake(function (params, callback) {
          callback(listQueryResponse);
        });

        spyOn(testUser, 'get').and.callFake(function (params, callback) {
            callback(testUser);
        });
        spyOn(testUser, 'addPhone').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'setPrimaryPhone').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'addEmail').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'setPrimaryEmail').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, '$update').and.callFake(function (callback) {
            callback();
        });

        $controller('CheckinCtrl', {
          $scope: scope,
          $routeParams: {userId: isCurrentUser ? currentUserId : differentUserId}
        });

        scope.$digest();

      });

    }

    beforeEach(function() {
      module('app.checkin');

      mockhrinfoService = {};
      module('app.common', function($provide) {
        $provide.value('hrinfoService', mockhrinfoService);
        $provide.value('alertService', {});
      });

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      mockUser = {};
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
      });

      mockGetText = {
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockConfig = {}
      mockConfig.listTypes = ['operation', 'list'];

      module('app.checkin', function($provide) {
        $provide.constant('config', mockConfig);
      });

    });

    describe('Check if checking in the current user', function () {

      describe('check in current user', function () {

        beforeEach(function () {
          ctrlSetup(true);
        });

        it('should set isCurrentUser to true', function () {
          scope.$digest();
          expect(scope.isCurrentUser).toBe(true);
        });
      });

      describe('check in a different user', function () {
        beforeEach(function () {
          ctrlSetup(false);
        });

        it('should set isCurrentUser to false', function () {
          scope.$digest();
          expect(scope.isCurrentUser).toBe(false);
        });
      });

    });

    describe('Searching lists', function() {

      beforeEach(function () {
        ctrlSetup(true);
      });
      
      it('should not search lists if there is no search term', function () {
        scope.getLists('');
        expect(mockList.query).not.toHaveBeenCalled();
      });

      it('should search lists of the selected type', function () {
        scope.selectedTypes.name = 'operation';
        scope.getLists('findme');

        var params = {
          name: 'findme',
          type: 'operation'
        };
        expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
      });

      it('should search lists of all types if not type selected', function () {
        scope.selectedTypes.name = 'all';
        scope.getLists('findme');

        var params = {
          name: 'findme'
        };
        expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
      });

      it('should add the returned lists to scope', function () {
        scope.getLists('findme');
        expect(scope.lists).toEqual(listQueryResponse);
      });

    });

    describe('Filtering returned lists', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should remove already selected lists from the returned lists', function () {
        var expectedFilteredList = [list1, list3, list4];
        scope.selectedLists = [list2]
        scope.getLists('findme');
        expect(scope.lists).toEqual(expectedFilteredList);
      });

      it('should remove lists the user is checked into from the returned lists', function () {
        var expectedFilteredList2 = [list1, list2, list4];
        scope.user.operations = [
          {
            _id: '222',
            list: list3
          }
        ]
        scope.getLists('findme');
        expect(scope.lists).toEqual(expectedFilteredList2);
      });

    });

    describe('Selecting lists to check in to', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should add the list to select lists', function () {
        scope.selectList(list1);
        expect(scope.selectedLists).toEqual([list1]);
      });

      it('should remove the list from select lists', function () {
        scope.selectedLists = [list1, list2, list3];
        scope.removeList(list2);
        expect(scope.selectedLists).toEqual([list1, list3]);
      });

    });

    // TO DO
    // describe('Associated lists', function () {

    // });

  });
})();
