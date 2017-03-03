(function() {
  'use strict';

  describe('All Check-ins controller', function () {

  	var mockAlertService, mockConfig, mockGetText, mockUserCheckInService, mockUserDataService, scope, userFixture;

  	var expectedLists = [{ _id: '3456', list: 'org-id-1', name: 'org1', type: 'organization' },
		{ _id: '7664', list: 'org-id-2', name: 'org2', type: 'organization' },
		{ _id: 'checkin-id-1', list: 'list-1-id', name: 'list-1', type: 'list' },
		{ _id: 'checkin-id-2', list: 'list-2-id', name: 'list-2', type: 'list' }];

		var expectedListsAfterCheckout = [{ _id: '3456', list: 'org-id-1', name: 'org1', type: 'organization' },
		{ _id: '7664', list: 'org-id-2', name: 'org2', type: 'organization' },
		{ _id: 'checkin-id-2', list: 'list-2-id', name: 'list-2', type: 'list' }];

  	beforeEach(function () {
  		userFixture = readJSON('app/test-fixtures/user.json');

  		mockConfig = {
  			listTypes: ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office']
  		};
  		module('app.checkin', function($provide) {
        $provide.constant('config', mockConfig);
      });

      mockGetText = {
      	getString: function(str) {
      		return str;
      	}
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockUserDataService = {
      	notify: function () {}
      };
      mockUserCheckInService = {
      	delete: function () {}
      };
      module('app.user', function($provide) {
        $provide.value('UserDataService', mockUserDataService);
        $provide.value('UserCheckInService', mockUserCheckInService);
      });

      mockAlertService = {
      	add: function () {}
      };
      module('app.common', function ($provide) {
      	$provide.value('alertService', mockAlertService);
      });

      spyOn(mockUserCheckInService, 'delete').and.callFake(function (arg1, arg2, callback, failCallback) {
      	if(arg1.listType === 'rejects') {
      		failCallback();
      	}
      	callback(userFixture.user1);
      });

      spyOn(mockAlertService, 'add').and.callFake(function (arg1, arg2, arg3, callback) {
      	callback();
      });

      spyOn(mockUserDataService, 'notify');

  		inject(function ($controller, $rootScope) {
  			scope = $rootScope.$new();

  			scope.currentUser = userFixture.user1;
  			scope.setCurrentUser = function () {};
  			spyOn(scope, 'setCurrentUser');

  			$controller('AllCheckInsCtrl', {
        	$scope: scope
      	});
      	scope.$digest();
  		});

  	});

  	describe('Get the user\'s list', function () {

  		it('should get the users lists', function () {
  			expect(scope.listsMember).toEqual(expectedLists);
  		});

  		it('should add the list type to the list', function () {
  			expect(scope.listsMember[2].type).toEqual('list');
  		});

  	});

  	describe('Check out from a list', function () {

  		beforeEach(function () {
  			scope.leaveList({ _id: 'checkin-id-1', list: 'list-1-id', name: 'list-1', type: 'list' });
  		});

  		it('should ask the user to confirm', function () {
  			expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
  		});

  		it('should check the user out', function () {
  			expect(mockUserCheckInService.delete).toHaveBeenCalledWith({userId: userFixture.user1._id, listType: 'lists', checkInId: 'checkin-id-1'}, {}, jasmine.any(Function), jasmine.any(Function));
  		});

  		it('should show the success message', function () {
  			expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Successfully removed from list', false, jasmine.any(Function));
  		});

  		it('should remove the list from the view', function () {
  			scope.$digest();
  			expect(scope.listsMember).toEqual(expectedListsAfterCheckout);
  		});

  		it('should update the currentUser', function () {
  			expect(mockUserDataService.notify).toHaveBeenCalled();
  			expect(scope.setCurrentUser).toHaveBeenCalledWith(userFixture.user1);
  		});

  	});

  	describe('If check out fails', function () {
  		beforeEach(function () {
  			scope.leaveList({type: 'reject'});
  		});

  		it('should show the error message', function () {
  			expect(mockAlertService.add).toHaveBeenCalledWith('danger', 'There was an error checking out of this list', false, jasmine.any(Function));
  		});
  	});

  });

})();
