(function() {
  'use strict';

  describe('LandingController', function () {

  	var $location, mockNotificationsService, notification, scope, userFixture;

  	notification = {
  		read: false,
  		notified: false,
  		link: 'linky'
  	};

  	beforeEach(function() {
  		userFixture = readJSON('app/test-fixtures/user.json');

  		module('app.dashboard');
  		mockNotificationsService = {
  			update: function () {}
  		};
  		spyOn(mockNotificationsService, 'update').and.callThrough();
  		module('app.notifications', function($provide) {
        $provide.value('notificationsService', mockNotificationsService);
      });

			inject(function($rootScope, $controller, _$location_) {
        scope = $rootScope.$new();
				$location = _$location_;

        spyOn($location, 'path').and.callThrough();
        scope.currentUser = userFixture.user1;
        scope.currentUser.appMetadata = {
  				hid: {
  					recentSearches: {
  						user: [{link: 'x', name: 'y'}],
  						list: [{link: 'd', name: 'f'}],
  						operation: [{link: 'a', name: 'v'}]
  					}
  				}
  			};

        $controller('LandingCtrl', {
          $scope: scope
        });

        scope.$digest();

      });
  	});

  	describe('Displaying recent searches', function () {

  		it('should add the user\'s recent user searches to the view', function () {
  			expect(scope.recentUserSearches).toEqual([{link: 'x', name: 'y'}]);
  		});

  		it('should add the user\'s recent list searches to the view', function () {
  			expect(scope.recentListSearches).toEqual([{link: 'd', name: 'f'}]);
  		});

  		it('should add the user\'s recent operation searches to the view', function () {
  			expect(scope.recentOperationSearches).toEqual([{link: 'a', name: 'v'}]);
  		});

  	});

  	describe('Mark a notification as read when the user clicks on it', function () {

  		beforeEach(function () {
  			scope.readNotification(notification);
  		});

  		it('should set read and notified to true on the notification', function () {
  			expect(notification.read).toBe(true);
  			expect(notification.notified).toBe(true);
  		});

  		it('should update the notification', function () {
  			expect(mockNotificationsService.update).toHaveBeenCalledWith(notification);
  		});

  		it('should go to the notification link', function () {
  			expect($location.path).toHaveBeenCalledWith('linky');
  		});

  	});

  });
})();
