(function() {
  'use strict';

  describe('Check-in controller', function () {

    var countries, currentUserId, differentUserId, list1, list2, list3, list4, listQueryResponse, scope, mockhrinfoService,
    mockList, mockUser, mockGetText, testUser;

    countries = ['france', 'uk'];
    listQueryResponse = ['something'];
    currentUserId = '1234';
    differentUserId = '4321';
    list1 = {id: 1, name: 'My list'};
    list2 = {id: 2, name: 'Another'};
    list3 = {id: 3, name: 'Words'};
    list4 = {id: 4, name: 'Guitars'};

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
          return listQueryResponse;
        };

        spyOn(testUser, 'get').and.callFake(function (params, callback) {
          scope.user = testUser;
            callback();
            // return testUser;
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

      module('app.checkin', function($provide) {
        $provide.constant('config', {});
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

    describe('Select lists to check in to', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should add the list to select lists', function () {
        scope.updateSelectedLists(list1);
        expect(scope.selectedLists).toEqual([list1]);
      });

      it('should remove the list from select lists', function () {
        scope.selectedLists = [list1, list2, list3];
        scope.removeList(list2);
        expect(scope.selectedLists).toEqual([list1, list3]);
      });

      it('should check if the list is already selected', function () {
        scope.selectedLists = [list1, list2, list3];
        expect(scope.isSelected(list3)).toBe(true);
        expect(scope.isSelected(list4)).toBe(false);
      });

    });

  });
})();
