(function() {
  'use strict';

  var $interval, $rootScope, AuthService, base64Url, httpBackend, mockConfig, mockNotificationsService, mockUserListsService, userFixture;

  describe('Auth service', function () {

  	beforeEach(function () {
  		userFixture = readJSON('app/test-fixtures/user.json');

  		mockConfig = {
  			apiUrl: 'http://mock-url/'
  		};
  		module('app.auth', function($provide) {
  			$provide.constant('config', mockConfig);
  		});

  		mockUserListsService = {};
  		mockUserListsService.cacheListsForUser = function () {};
  		module('app.user', function($provide) {
  			$provide.constant('UserListsService', mockUserListsService);
  		});

  		spyOn(mockUserListsService, 'cacheListsForUser').and.callThrough();

  		mockNotificationsService = {};
  		module('app.notifications', function($provide) {
  			$provide.constant('notificationsService', mockNotificationsService);
  		});



  		inject(function(_AuthService_, _$httpBackend_,  _$interval_, _$rootScope_, config) {
  			AuthService = _AuthService_;
  			httpBackend = _$httpBackend_;
  			config = mockConfig;
  			$interval =  _$interval_;
  			$rootScope = _$rootScope_;

  			spyOn(AuthService, 'parseToken').and.callThrough();
  		});
  		spyOn($interval, 'cancel').and.callThrough();
  	});

  	afterEach(function() {
	    httpBackend.verifyNoOutstandingExpectation();
	    httpBackend.verifyNoOutstandingRequest();
	    window.localStorage.clear();
	  });

  	describe('Login', function () {

  		beforeEach(function () {
  			AuthService.login('test@example.com', 'my-password');
  		});

  		it('should log the user in', function () {
  			httpBackend.expectPOST('http://mock-url/jsonwebtoken', {"email":"test@example.com","password":"my-password"}).respond({});
	      httpBackend.flush();
  		});

  		it('should store the token and the user', function () {
  			httpBackend.whenPOST('http://mock-url/jsonwebtoken', {"email":"test@example.com","password":"my-password"}).respond({
  				token: 'a-token',
  				user: userFixture.user1
  			});
				httpBackend.flush();  			
  			expect(window.localStorage.getItem('jwtToken')).toEqual('a-token');
  			expect(window.localStorage.getItem('currentUser')).toEqual(JSON.stringify(userFixture.user1));
  			
  		});

  	});

  	describe('Log out', function () {

  		beforeEach(function () {
  			window.localStorage.setItem('jwtToken', 'a-token');
  			window.localStorage.setItem('currentUser', JSON.stringify(userFixture.user1));
  			AuthService.logout();
  		});

  		it('should remove the token and user from localStorage', function () {
  			$rootScope.$digest();
  			expect(window.localStorage.getItem('jwtToken')).toEqual(null);
  			expect(window.localStorage.getItem('currentUser')).toEqual(null);
  		});

  		it('should cancel the caching and notifications intervals', function () {
  			expect($interval.cancel.calls.count()).toBe(2);
  		});

  	});

  	describe('Authenticate', function () {

  		it('should not authenticate if no token is present', function () {
  			expect(AuthService.isAuthenticated()).toBe(false);
  		});

  		// describe('token is present', function () {

  		// 	beforeEach(function () {
  		// 		window.localStorage.setItem('jwtToken', 'a-token');
  		// 		window.localStorage.setItem('currentUser', JSON.stringify(userFixture.user1));
  		// 		AuthService.isAuthenticated();
  		// 	});

  			//check the toekn

  			// check notifications and set up interval

  			// cache lists and start interval

  		// 	it('should cache user lists', function () {
  		// 		// expect(mockUserListsService.cacheListsForUser).toHaveBeenCalled();
  		// 	})

  		// });

  	});

  });

 })();
