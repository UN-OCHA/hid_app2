describe('Check-in controller', function () {

  'use strict';

  var countries, currentUserId, differentUserId, list1, list2, list3, list4, listQueryResponse, scope, mockhrinfoService, mockList, mockUser, testUser;

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
      }
      testUser.setPrimaryPhone = function () {
        return;
      }
      testUser.addEmail = function () {
        return;
      }
      testUser.setPrimaryEmail = function () {
        return;
      }
      testUser.$update = function () {
        return;
      }
      testUser.get = function () {
        return testUser;
      }

      scope.currentUser = {
        _id: currentUserId
      }
      scope.editPhoneForm = {};
      scope.editEmailForm = {};
      scope.editLocationForm = {};

      mockhrinfoService.getCountries = function () {
        var defer = $q.defer();
        defer.resolve(countries);
        return defer.promise;
      }

      mockList.query = function () {
        return listQueryResponse;
      }

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
    module('hidApp');

    mockhrinfoService = {};
    module('appServices', function($provide) {
      $provide.value('hrinfoService', mockhrinfoService);
    });

    mockList = {};
    module('listServices', function($provide) {
      $provide.value('List', mockList);
    });

    mockUser = {};
    module('userServices', function($provide) {
      $provide.value('User', mockUser);
    });
  });

  describe('Check if checking in the current user', function () {

    describe('check in current user', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should set isCurrentUser to true', function () {
        expect(scope.isCurrentUser).toBe(true);
      });
    });

    describe('check in a different user', function () {
      beforeEach(function () {
        ctrlSetup(false);
      });

      it('should set isCurrentUser to false', function () {
        expect(scope.isCurrentUser).toBe(false);
      });
    });

  });

  describe('Update user details', function () {

    beforeEach(function () {
      ctrlSetup(true);
    });

    describe('Updating primary phone number', function () {

      beforeEach(function () {
        scope.newPhoneNumber = {
          type: 'Mobile',
          number: '0777000'
        }
        scope.updatePhone();
        scope.$digest();
      });

      it('should update the primary phone number', function () {
        expect(mockUser.addPhone).toHaveBeenCalledWith(scope.newPhoneNumber, jasmine.any(Function), jasmine.any(Function));
        expect(mockUser.setPrimaryPhone).toHaveBeenCalledWith(scope.newPhoneNumber.number, jasmine.any(Function), jasmine.any(Function));
        expect(scope.user.phone_number).toEqual(scope.newPhoneNumber.number);
      });

      it('should update the checkin modifications', function () {
        var expectedMods = 'Changed phone number to: 0777000';
        expect(scope.modifications.phone).toEqual(expectedMods);
      });

    });

    describe('Updating primary email', function () {

      beforeEach(function () {
        scope.newEmail = {
          type: 'Work',
          email: 'update@email.com'
        }
        scope.updateEmail();
        scope.$digest();
      });

      it('should update the primary email address', function () {
        expect(mockUser.addEmail).toHaveBeenCalledWith(scope.newEmail, jasmine.any(Function), jasmine.any(Function));
        expect(mockUser.setPrimaryEmail).toHaveBeenCalledWith(scope.newEmail.email, jasmine.any(Function), jasmine.any(Function));
        expect(scope.user.email).toEqual(scope.newEmail.email);
      });

      it('should update the checkin modifications', function () {
        var expectedMods = 'Changed email address to: update@email.com';
        expect(scope.modifications.email).toEqual(expectedMods);
      });

    });

    describe('Updating current location', function () {

      beforeEach(function () {
        scope.newLocation = {
          country: {
            name: 'Scotland'
          },
          region: {
            name: 'Aberdeenshire'
          }
        }
        scope.updateLocation();
        scope.$digest();
      });

      it('should update the current location', function () {
        expect(scope.user.location).toEqual(scope.newLocation);
        expect(mockUser.$update).toHaveBeenCalled();
      });

      it('should update the checkin modifications', function () {
        var expectedMods = 'Changed location to: Aberdeenshire, Scotland';
        expect(scope.modifications.location).toEqual(expectedMods);
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
