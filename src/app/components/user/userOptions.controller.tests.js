(function() {
  'use strict';

  describe('User options controller', function () {

    var allLists, listFixture, ownedAndManagedLists, mockConfig, mockAlertService, mockList, mockListDataService, 
    mockUibModal, mockUser, mockUserCheckInService, mockUserDataService, modalResult, scope, searchTerm, userFixture;    
    
    beforeEach(function() {
      userFixture = readJSON('app/test-fixtures/user.json');
      listFixture = readJSON('app/test-fixtures/list.json');
      searchTerm = 'findme';

      allLists = listFixture.lists;
      ownedAndManagedLists = listFixture.lists;

      mockUser = userFixture.user1;
      mockUser.$update = function () {};
      mockUser.$delete = function () {};
      spyOn(mockUser, '$update').and.callFake(function () {});
      spyOn(mockUser, '$delete').and.callFake(function () {});

      modalResult = {
        then: function() {}
      };

      mockUibModal = {
        open: function() {}
      }; 
 
      spyOn(mockUibModal, 'open').and.returnValue({result: modalResult });

      mockAlertService = {};
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockList = {};
      mockListDataService = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
        $provide.value('ListDataService', mockListDataService);
      });

      mockUserCheckInService = {};
      mockUserDataService = {};
      mockConfig = {};
      mockConfig.listTypes = ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office'];
      module('app.user', function($provide) {
        $provide.value('UserCheckInService', mockUserCheckInService);
        $provide.value('UserDataService', mockUserDataService);
        $provide.constant('config', mockConfig);
      });

      inject(function($rootScope, $q, $injector, $controller) {
        scope = $rootScope.$new();

        mockAlertService.add = function () {};
        mockUserCheckInService.delete = function () {};
        mockList.query = function () {};
        mockListDataService.getManagedAndOwnedLists = function () {};

        spyOn(mockAlertService, 'add').and.callFake(function (argument1, argument2, arg3, callback) {
            callback();
        });

        spyOn(mockUserCheckInService, 'delete').and.callThrough();
        spyOn(mockListDataService, 'getManagedAndOwnedLists').and.callFake(function(arg, searchTerm, callback) {
          callback(ownedAndManagedLists);
        });
        spyOn(mockList, 'query').and.callFake(function(arg, callback) {
          callback(allLists);
        });

        $controller('UserOptionsCtrl', {
          $scope: scope,
          $uibModal: mockUibModal
        });

        scope.$digest();
      });

    });

    describe('Remove user from the list', function () {

      beforeEach(function () {
        scope.removeFromList(mockUser, listFixture.lists[1]);
      });

      it('should ask the user to confirm they want the removal', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
      });

      it('should check the user out of the list', function () {
        var deleteParams = {userId: mockUser._id, listType: 'lists', checkInId: 'checkin-id-2'};
        expect(mockUserCheckInService.delete).toHaveBeenCalledWith(deleteParams, {}, jasmine.any(Function), jasmine.any(Function));
      });

    });

    describe('Verifying / unverifying users', function () {

      it('should verify the user', function () { 
        scope.verifyUser(mockUser);

        expect(mockUser.verified).toBe(true);
        expect(mockUser.$update).toHaveBeenCalled();
      });

      it('should un-verify the user', function () { 
        mockUser.verified = true;
        scope.verifyUser(mockUser);

        expect(mockUser.verified).toBe(false);
        expect(mockUser.$update).toHaveBeenCalled();
      });
    });
    
    describe('Deleting a user', function () {

      beforeEach(function () {
        scope.deleteUser(mockUser);
      });

      it('should ask the user to confirm they want to delete', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('danger', 'Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.', true, jasmine.any(Function));
      });

      it('should delete the user', function () {
        expect(mockUser.$delete).toHaveBeenCalled();
      });
    });
    
    describe('Checking user into lists', function () {

      describe('As an admin', function () {
        beforeEach(function () {
          scope.selectedLists = [listFixture.lists[4]];
          scope.openCheckInModal({}, true);
        });

        it('should open the modal', function () {
          expect(mockUibModal.open).toHaveBeenCalled();
        });

        describe('Getting available lists', function () {
          beforeEach(function () {
            scope.getAvailableLists(userFixture.adminUser, userFixture.user1, 'findme');
          });

          it('should get lists with your searchTerm', function () {
            var params = {
              name: 'findme',
              limit: 50,
              sort: 'name'
            };
            expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
          });

          it('should remove any lists the user is already in or that have already been selected', function () {
            var expectedLists = [listFixture.lists[2], listFixture.lists[3], listFixture.lists[5]];
            expect(scope.availableLists).toEqual(expectedLists);
          });

        });
        
      });

      describe('As a global manager', function () {
        beforeEach(function () {
          scope.selectedLists = [listFixture.lists[4]];
          scope.openCheckInModal({}, true);
        });

        it('should open the modal', function () {
          expect(mockUibModal.open).toHaveBeenCalled();
        });

        describe('Getting available lists', function () {
          beforeEach(function () {
            scope.getAvailableLists(userFixture.globalManagerUser, userFixture.user1, 'findme');
          });

          it('should get lists with your searchTerm', function () {
            var params = {
              name: 'findme',
              limit: 50,
              sort: 'name'
            };
            expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
          });

          it('should remove any lists the user is already in or that have already been selected', function () {
            var expectedLists = [listFixture.lists[2], listFixture.lists[3], listFixture.lists[5]];
            expect(scope.availableLists).toEqual(expectedLists);
          });

        });
        
      });

      describe('As a normal user', function () {
        
        describe('Getting available lists', function () {
          beforeEach(function () {
            scope.selectedLists = [listFixture.lists[3]];
            scope.getAvailableLists(userFixture.user2, userFixture.user1, 'findme');
          });

          it('should get lists you own and manage', function () {
            expect(mockListDataService.getManagedAndOwnedLists).toHaveBeenCalledWith(userFixture.user2, 'findme', jasmine.any(Function));
          });

          it('should remove any lists the user is already in or that have already been selected', function () {
            var expectedLists = [listFixture.lists[2], listFixture.lists[4], listFixture.lists[5]];
            expect(scope.availableLists).toEqual(expectedLists);
          });

        });
        
      });

    });

  });
})();

