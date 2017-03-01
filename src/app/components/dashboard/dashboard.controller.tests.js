(function() {
  'use strict';

  describe('DashboardCtrl controller', function () {

  	var deleteServiceSpy, favoriteLists, listFixture, listsMember, listsOwnedAndManaged, mockAlertService, mockConfig, mockGetText, mockList, mockService, mockUser, 
    mockUserCheckInService, mockUserDataService, mockUserListsService, scope, unsubscribeServiceSpy, userFixture;
	
  	beforeEach(function() {
      module('app.dashboard');

  		userFixture = readJSON('app/test-fixtures/user.json');
      listFixture = readJSON('app/test-fixtures/list.json');
      favoriteLists = userFixture.user1.favoriteLists;
      listsMember = [listFixture.lists[2], listFixture.lists[3]];
      
      mockList = listFixture.lists[4];
      mockList.$delete = function () {};
      listsOwnedAndManaged = [mockList, listFixture.lists[5]];

      mockUserListsService = {
        getListsForUser: function () {},
        favoriteLists: favoriteLists,
        listsMember: listsMember,
        listsOwnedAndManaged: listsOwnedAndManaged
      };
      mockUser = {
        update: function () {}
      };
      mockUserCheckInService = {
        delete: function () {}
      };
      mockUserDataService = {
        notify: function () {}
      };
      spyOn(mockUserListsService, 'getListsForUser');
      spyOn(mockUser, 'update').and.callFake(function(arg, callback) {
        callback();
      });
      spyOn(mockUserCheckInService, 'delete').and.callFake(function(arg1, arg2, callback) {
        callback(userFixture.user1);
      });
      spyOn(mockUserDataService, 'notify');
      module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.value('UserListsService', mockUserListsService);
        $provide.value('User', mockUser);
        $provide.value('UserCheckInService', mockUserCheckInService);
        $provide.value('UserDataService', mockUserDataService);

      });

      deleteServiceSpy = jasmine.createSpy('del');
      mockService = function () {
        return {
          $delete: deleteServiceSpy,
        };
      };
      module('app.service', function($provide) {
        $provide.value('Service', mockService);
      });

      mockAlertService = {
        add: function () {}
      };
      spyOn(mockAlertService, 'add').and.callFake(function (arg1, arg2, arg3, callback) {
        callback();
      });
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockGetText = {
        getString: function (str) {
          return str;
        }
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

			inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
				
        scope.currentUser = userFixture.user1;
        scope.setCurrentUser = function () {};
        spyOn(scope, 'setCurrentUser');
        spyOn(mockList, '$delete').and.callFake(function (callback) {
          callback();
        });

        $controller('DashboardCtrl', {
          $scope: scope
        });
        
        scope.$digest();

      });
  	});

    describe('Showing user lists', function () {

      it('should get the lists for the user', function () {
        expect(mockUserListsService.getListsForUser).toHaveBeenCalledWith(userFixture.user1);
      });

      it('should populate the favorite lists', function () {
        scope.favoriteLists = favoriteLists;
      });

      it('should populate the lists the user is a part of', function () {
        scope.listsMember = listsMember;
      });

      it('should populate the lists the user owns or manages', function () {
        scope.listsOwnedAndManaged = listsOwnedAndManaged;
      });

    });

    describe('Showing user subscriptions', function () {

      it('should populate the subscriptions', function () {
        expect(scope.subscriptions).toEqual(userFixture.user1.subscriptions);
      });

      it('should add a flag to subscriptions the user owns', function () {
        expect(scope.subscriptions[0].isOwner).toBe(true);
      });

      it('should add a flag to subscriptions the user manages', function () {
        expect(scope.subscriptions[1].service.isManager).toBe(true);
      });

      it('should not add a flag to subscriptions the user does not own or manage', function () {
        expect(scope.subscriptions[2].isOwner).toBeUndefined();
        expect(scope.subscriptions[2].service.isManager).toBeUndefined();
      });

    });

    describe('Removing a list from favourites', function () {
      beforeEach(function () {
        scope.removeFavorite(userFixture.user1.favoriteLists[0]);
      });

      it('should remove the list from the displayed favourites', function () {
        expect(scope.currentUser.favoriteLists).toEqual([{_id: 'fav-2'}]);
      });

      it('should update the user', function () {
        expect(mockUser.update).toHaveBeenCalledWith(userFixture.user1, jasmine.any(Function));
        expect(scope.setCurrentUser).toHaveBeenCalledWith(userFixture.user1);
      });

      it('should show the success message', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('success', 'This list was removed from your favourites.', false, jasmine.any(Function));
      });

    });

    describe('Leaving a list', function () {

      beforeEach(function () {
        scope.leaveList(listFixture.lists[3]);
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
      });

      it('should check the user out of the list', function () {
        expect(mockUserCheckInService.delete).toHaveBeenCalledWith({userId: userFixture.user1._id, listType: listFixture.lists[3].type + 's', checkInId: listFixture.lists[3].checkinId}, {}, jasmine.any(Function));
      });

      it('should remove the list from the displayed lists they are a member of', function () {
        scope.$digest();
        expect(scope.listsMember).toEqual([listFixture.lists[2]]);
      });

      it('should update the current user', function () {
        scope.$digest();
        expect(scope.setCurrentUser).toHaveBeenCalledWith(userFixture.user1);
        expect(mockUserDataService.notify).toHaveBeenCalled();
      });

      it('should show the success message', function () {
        scope.$digest();
        expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Successfully removed from list.', false, jasmine.any(Function));
      });

    });

    describe('Delete a list', function () {

      beforeEach(function () { 
        scope.deleteList(mockList);
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
      });

      it('should delete the list', function () {
        scope.$digest();
        expect(mockList.$delete).toHaveBeenCalled();
      });

      it('should remove the list from the displayed lists they own and manage', function () {
        scope.$digest();
        expect(scope.listsOwnedAndManaged).toEqual([listFixture.lists[5]]);
      });

      it('should show the success message', function () {
        scope.$digest();
        expect(mockAlertService.add).toHaveBeenCalledWith('success', 'The list was successfully deleted.', false, jasmine.any(Function));
      });

    });

    describe('Deleting a service', function () {

      beforeEach(function () { 
        var sub = scope.subscriptions[0];
        scope.deleteService(sub);
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
      });

      it('should delete the service', function () {
        scope.$digest();
        expect(deleteServiceSpy).toHaveBeenCalled();
      });
    });

    //TO DO
    // fdescribe('Unsubscribing from a service', function () {

    //   beforeEach(function () { 
        
    //   });

    //   it('should ask the user to confirm', function () {
    //   });

    //   it('should unsbscribe from the service', function () {
        
    //   });

    // });

  });
})();
