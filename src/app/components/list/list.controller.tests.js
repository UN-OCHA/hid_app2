(function() {
  'use strict';

  describe('List controller', function () {

  	var ctrlParams, listFixture, mockAlertService, mockConfig, mockGetText, mockLf, mockList, mockListDataService, mockLocalForage, 
  	mockUser, mockUserCheckInService, mockUserDataService, scope, testList, userFixture;

  	function setUpCtrl (list, currentUser, offline) {
  		testList = list;
    	testList.isManager = function () {};
    	spyOn(testList, 'isManager');
    	testList.$delete = function () {};
    	spyOn(testList, '$delete').and.callFake(function (callback) {
    		callback();
    	});

    	spyOn(mockList, 'get').and.callFake(function (params, success, failure) {
    		if (offline) {
    			failure();
    			return;
    		}
    		success(testList);
    	});

      inject(function($rootScope, $controller, _$location_, $q) {
      	scope = $rootScope.$new();
      	scope.currentUser = currentUser;
      	scope.$broadcast = function () {};
      	spyOn(scope, '$broadcast');

      	mockLf = {
      		getItem: function () {}
      	};
      	spyOn(mockLf, 'getItem').and.returnValue($q.when(testList));

      	mockLocalForage = {
      		instance: function () {}
      	};
      	spyOn(mockLocalForage, 'instance').and.returnValue(mockLf);

      	scope.setCurrentUser = function () {};
      	spyOn(scope, 'setCurrentUser');

      	ctrlParams = {
          $scope: scope,
          $routeParams: {
          	list: testList._id
          },
          $localForage: mockLocalForage
        };

      	$controller('ListCtrl', ctrlParams);      	
        scope.$digest();
      });
    }

    beforeEach(function () {
    	listFixture = readJSON('app/test-fixtures/list.json');
    	userFixture = readJSON('app/test-fixtures/user.json');

    	mockConfig = {
    		listTypes: ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office']
    	};
    	mockList = {
    		get: function () {}
    	};
    	mockListDataService = {
    		setListTypeLabel: function () {}
    	};
    	spyOn(mockListDataService, 'setListTypeLabel');
    	module('app.list', function($provide) {
        $provide.value('List', mockList);
        $provide.value('ListDataService', mockListDataService);
        $provide.constant('config', mockConfig);
      });

      mockUser = {
      	query: function () {},
      	update: function () {}
      };
      spyOn(mockUser, 'query').and.callFake(function(arg, callback) {
      	callback([userFixture.user1, userFixture.user2, userFixture.adminUser, userFixture.globalManagerUser]);
      });
      spyOn(mockUser, 'update').and.callFake(function(arg, callback) {
      	callback();
      });

    	mockUserCheckInService = {
    		delete: function () {},
    		update: function () {},
    		save: function () {}
    	};
    	spyOn(mockUserCheckInService, 'delete').and.callFake(function (arg1, arg2, callback) {
    		callback();
    	});
    	spyOn(mockUserCheckInService, 'update').and.callFake(function (arg1, arg2, callback) {
    		callback();
    	});
    	spyOn(mockUserCheckInService, 'save').and.callFake(function (arg1, arg2, callback) {
    		callback();
    	});

    	mockUserDataService = {
    		notify: function () {}
    	};
    	spyOn(mockUserDataService, 'notify');
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
        $provide.value('UserCheckInService', mockUserCheckInService);
        $provide.value('UserDataService', mockUserDataService);
      });

      mockAlertService = {
      	add: function () {}
      };
      spyOn(mockAlertService, 'add').and.callFake(function (arg1, arg2, arg3, callback) {
      	if (callback) {
      		callback();
      	}
      });
      module('app.common', function ($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockGetText = {
        getString: function(str) {
          return str;
        }
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

    });

    describe('Viewing a list', function () {
    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    	});

    	it('should get the list', function () {
    		expect(mockList.get).toHaveBeenCalledWith({'listId': listFixture.lists[0]._id}, jasmine.any(Function), jasmine.any(Function));
    	});

    	it('should add the list to the view', function () {
    		expect(scope.list).toEqual(listFixture.lists[0]);
    	});

    	it('should hide the loader', function () {
    		expect(scope.listLoaded).toBe(true);
    	});

    	it('should set the list label type', function () {
    		expect(mockListDataService.setListTypeLabel).toHaveBeenCalledWith(listFixture.lists[0]);
    	});

    	it('should populate the list users', function () {
    		var listType = [];
    		listType['lists.list'] = listFixture.lists[0]._id;
    		expect(scope.$broadcast).toHaveBeenCalledWith('populate-list', listType);
    	});

    	it('should check if the current user is a manager of the list', function () {
    		expect(testList.isManager).toHaveBeenCalledWith(userFixture.user1);
    	});

    	it('should populate the checkin user', function () {
    		var checkinUser = {
    			list: listFixture.lists[0]._id
    		};
    		expect(scope.checkinUser).toEqual(checkinUser);
    	});

    });

    describe('Viewing a list you don\'t have access to view', function () {
    	
    	beforeEach(function () {
    		listFixture.lists[0].visible = false;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    	});

    	it('should not populate the list', function () {
    		expect(scope.$broadcast).not.toHaveBeenCalled();
    	});
    });

    describe('Viewing an offline list', function () {

    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1, true);
    		scope.$emit('user-service-ready');
    	});

    	it('should get the list from localForage', function () {
    		expect(mockLocalForage.instance).toHaveBeenCalledWith('lists');
    		expect(mockLf.getItem).toHaveBeenCalledWith(listFixture.lists[0]._id);	
    	});

    	it('should populate the list details', function () {
    		scope.$digest();
    		expect(scope.list).toEqual(listFixture.lists[0]);
    	});

    	it('should populate the list users', function () {
    		scope.$digest();
    		var listType = [];
    		listType['lists.list'] = listFixture.lists[0]._id;
    		expect(scope.$broadcast).toHaveBeenCalledWith('populate-list', listType);
    	});
    });

   describe('Check if the current user\'s check in for the list is pending', function () {


    	describe('Current user\'s check in is pending', function () {

    		beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		userFixture.user1.lists[0].pending = true;
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    	});

    		it('should show that the checkin is pending', function () {
    			expect(scope.isPending).toBe(true);
    		});

    	});

    	describe('Current user\'s check in is not pending', function () {

    		beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    	});

    		it('should show that the checkin is not pending', function () {
    			expect(scope.isPending).toBe(false);	
    		});

    	});

    	describe('Current user is not checked in to the list', function () {

    		beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		delete userFixture.user1.lists[0];
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    	});

    		it('should show that the checkin is not pending', function () {
    			expect(scope.isPending).toBe(false);	
    		});

    	});

    });

    describe('Check if the current user is checked into the list', function () {
    	
    	it('should set isMember to true if the user is checked in', function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isMember).toBe(true);
    	});

    	it('should set isMember to false if the user is not checked in', function () {
    		listFixture.lists[0].visible = true;
    		delete userFixture.user1.lists[0];
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isMember).toBe(false);
    	});

    });

    describe('Check if the current user is the owner of the list', function () {
    	
    	it('should set isOwner to true if the user is the owner', function () {
    		listFixture.lists[0].visible = true;
    		listFixture.lists[0].owner = {
    			_id: userFixture.user1._id
    		};
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isOwner).toBe(true);
    	});

    	it('should set isOwner to false if the user is not the owner', function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isOwner).toBe(false);
    	});

    });

    describe('Check if the current user has favourited the list', function () {
    	
    	it('should set isFavorite to true if they have favourited the list', function () {
    		listFixture.lists[0].visible = true;
    		userFixture.user1.favoriteLists.push(listFixture.lists[0]);
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isFavorite).toBe(true);
    	});

    	it('should set isFavorite to false if they have not favourited the list', function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		expect(scope.isFavorite).toBe(false);
    	});

    });

    describe('Checking in to the list', function () {

    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		scope.checkIn();
    	});
    	
    	it('should check in to the list', function () {
    		var checkinUser = {
    			list: listFixture.lists[0]._id
    		};
    		var params = {userId: userFixture.user1._id, listType: listFixture.lists[0].type + 's'};
    		expect(mockUserCheckInService.save).toHaveBeenCalledWith(params, checkinUser, jasmine.any(Function));
    	});

    	it('should show the success message', function () {
    		expect(mockAlertService.add).toHaveBeenCalledWith('success', 'You were successfully checked in.');
    	});

    	it('should set isMember to true', function () {
    		expect(scope.isMember).toBe(true);
    	});

    	it('should update the current User', function () {
    		expect(scope.setCurrentUser).toHaveBeenCalled();
    	});

    	it('should notify the UserDataService', function () {
    		expect(mockUserDataService.notify).toHaveBeenCalled();
    	});
    });

    describe('Checking out from the list', function () {
  
    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		scope.checkOut();
    	});

    	it('should ask the user to confirm', function () {
    		expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
    	});

    	it('should check out from the list', function () {
    		var params = {userId: userFixture.user1._id, listType: listFixture.lists[0].type + 's', checkInId: userFixture.user1.lists[0]._id};
    		expect(mockUserCheckInService.delete).toHaveBeenCalledWith(params, {}, jasmine.any(Function));
    	});
    });

    describe('Favouriting the list', function () {

    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		scope.star();
    	});

    	it('should add the list to the user\'s favourites', function () {
    		expect(scope.currentUser.favoriteLists).toContain(listFixture.lists[0]);
    	});

    	it('should favourite the list', function () {
    		expect(mockUser.update).toHaveBeenCalledWith(userFixture.user1, jasmine.any(Function));
    	});

    	it('should show the success message', function () {
    		expect(mockAlertService.add).toHaveBeenCalledWith('success', 'This list was successfully added to your favourites.');
    	});

    	it('should set isFavorite to true', function () {
    		expect(scope.isFavorite).toBe(true);
    	});

    	it('should update the current User', function () {
    		expect(scope.setCurrentUser).toHaveBeenCalled();
    	});
    	
    });

    describe('Un-favouriting the list', function () {

    	beforeEach(function () {
    		listFixture.lists[0].visible = true;
    		userFixture.user1.favoriteLists.push(listFixture.lists[0]);
    		setUpCtrl(listFixture.lists[0], userFixture.user1);
    		scope.$emit('user-service-ready');
    		scope.unstar();
    	});

    	it('should remove the list from the user\'s favourites', function () {
    		expect(scope.currentUser.favoriteLists).not.toContain(listFixture.lists[0]);
    	});

    	it('should unfavourite the list', function () {
    		expect(mockUser.update).toHaveBeenCalledWith(userFixture.user1, jasmine.any(Function));
    	});

    	it('should show the success message', function () {
    		expect(mockAlertService.add).toHaveBeenCalledWith('success', 'This list was successfully removed from your favourites.');
    	});

    	it('should set isFavorite to true', function () {
    		expect(scope.isFavorite).toBe(false);
    	});

    	it('should update the current User', function () {
    		expect(scope.setCurrentUser).toHaveBeenCalled();
    	});

    });

    describe('List owner/manager actions', function () {

    	describe('Adding members to the list', function () {

    		beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    		scope.usersAdded = {
	    			users: []
	    		};
	    		scope.usersAdded.users.push(userFixture.adminUser._id);
	    		scope.getUsers('findme');
	    	});

    		it('should search for users', function () {
    			expect(mockUser.query).toHaveBeenCalledWith({name: 'findme'}, jasmine.any(Function));
	    	});

	    	it('should filter out users who are already checked in and who have already been selected', function () {
	    		expect(scope.newMembers).toEqual([userFixture.user2, userFixture.globalManagerUser]);
	    	});

	    	it('should check in the users', function () {
	    		scope.usersAdded.users = [userFixture.user2._id, userFixture.globalManagerUser._id];
	    		scope.addMemberToList();
	    		var params = {userId: userFixture.user2._id, listType: listFixture.lists[0].type + 's'};
	    		expect(mockUserCheckInService.save).toHaveBeenCalledWith(params, {list: listFixture.lists[0]._id}, jasmine.any(Function), jasmine.any(Function));

	    		var params2 = {userId: userFixture.globalManagerUser._id, listType: listFixture.lists[0].type + 's'};
	    		expect(mockUserCheckInService.save).toHaveBeenCalledWith(params2, {list: listFixture.lists[0]._id}, jasmine.any(Function), jasmine.any(Function));
	    	});
	    });

	    describe('Pending checkins for the list', function () {

	    	beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		userFixture.user2.lists = [{_id: 'checkin-id', list: listFixture.lists[0]._id}];
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    		scope.approveUser(userFixture.user2);
	    	});

	    	it('should as for confirmation', function () {
	    		expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
	    	});

	    	it('should approve the user\'s checkin', function () {
	    		var params = {userId: userFixture.user2._id, listType: listFixture.lists[0].type + 's', checkInId: userFixture.user2.lists[0]._id};
	    		expect(mockUserCheckInService.update).toHaveBeenCalledWith(params, {pending: false}, jasmine.any(Function));
	    	});

	    	it('should show the success message', function () {
	    		expect(mockAlertService.add).toHaveBeenCalledWith('success', 'The user was successfully approved.');
	    	});

	    	it('should set the user to not be pending', function () {
	    		expect(userFixture.user2.pending).toBe(false);
	    	});

	    });

	    describe('Deleting the list', function () {

	    	beforeEach(function () {
	    		listFixture.lists[0].visible = true;
	    		setUpCtrl(listFixture.lists[0], userFixture.user1);
	    		scope.$emit('user-service-ready');
	    		scope.deleteList();
	    	});

	    	it('should as for confirmation', function () {
	    		expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
	    	});

	    	it('should delete the list', function () {
	    		expect(testList.$delete).toHaveBeenCalled();
	    	});

	    	it('should show the success message', function () {
	    		scope.$digest();
	    		expect(mockAlertService.add).toHaveBeenCalledWith('success', 'The list was successfully deleted.');
	    	});
	    });

    });

  });
})();
