(function() {
  'use strict';

  var $interval, $localForage, $rootScope, $timeout, AuthService, httpBackend, mockConfig, mockLf, mockLocalForage, mockNotificationsService,
  mockUserListsService, userFixture;

  describe('Auth service', function () {

    function setUpCtrl (token) {
      inject(function(_AuthService_, _$httpBackend_,  _$interval_, _$rootScope_, config, $q, _$timeout_) {
        AuthService = _AuthService_;
        httpBackend = _$httpBackend_;
        config = mockConfig;
        $interval =  _$interval_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $localForage = mockLocalForage;

        spyOn(mockNotificationsService, 'getUnread').and.returnValue($q.when());
        spyOn(AuthService, 'parseToken').and.returnValue(token);
        spyOn($interval, 'cancel').and.callThrough();

        mockLf = {
          getItem: function () {}
        };
        spyOn(mockLf, 'getItem').and.returnValue($q.when());
        spyOn(mockLocalForage, 'instance').and.returnValue(mockLf);

      });
    }

  	beforeEach(function () {
  		userFixture = readJSON('app/test-fixtures/user.json');

  		mockConfig = {
  			apiUrl: 'http://mock-url/'
  		};
      mockLocalForage = {
        instance: function () {}
      };
  		module('app.auth', function($provide) {
  			$provide.constant('config', mockConfig);
        $provide.constant('$localForage', mockLocalForage);
  		});

  		mockUserListsService = {};
  		mockUserListsService.cacheListsForUser = function () {};
  		module('app.user', function($provide) {
  			$provide.constant('UserListsService', mockUserListsService);
  		});

  		spyOn(mockUserListsService, 'cacheListsForUser').and.callThrough();

  		mockNotificationsService = {
        getUnread: function () {}
      };

  		module('app.notifications', function($provide) {
  			$provide.constant('notificationsService', mockNotificationsService);
  		});

  	});

  	afterEach(function() {
	    httpBackend.verifyNoOutstandingExpectation();
	    httpBackend.verifyNoOutstandingRequest();
	    window.localStorage.clear();
	  });

  	describe('Login', function () {

  		beforeEach(function () {
        setUpCtrl();
  			AuthService.login('test@example.com', 'my-password');
  		});

  		it('should log the user in', function () {
        var expiry =  moment().add(1, 'days').unix();
  			httpBackend.expectPOST('http://mock-url/jsonwebtoken', {"email":"test@example.com","password":"my-password", exp: expiry}).respond({});
	      httpBackend.flush();
  		});

  		it('should store the token and the user', function () {
        var expiry =  moment().add(1, 'days').unix();
  			httpBackend.whenPOST('http://mock-url/jsonwebtoken', {"email":"test@example.com","password":"my-password", exp: expiry}).respond({
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
        setUpCtrl();
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
        setUpCtrl();

        AuthService.isAuthenticated(function (resp) {
          expect(resp).toBe(false);
        });
  		});

  		describe('token is present', function () {

  			beforeEach(function () {
  				window.localStorage.setItem('jwtToken', 'a-token');
  				window.localStorage.setItem('currentUser', JSON.stringify(userFixture.user1));
  			});

        describe('token is expired', function () {

          beforeEach(function () {
            setUpCtrl({exp: moment().subtract(1, 'day').unix()});
          });

          it('should not authenticate', function () {
            AuthService.isAuthenticated(function (resp) {
              expect(resp).toBe(false);
            });
          });

        });

        describe('token is not expired and does not need to be refreshed', function () {

          beforeEach(function () {
            setUpCtrl({exp: moment().add(1, 'day').unix()});
          });

          it('should authenticate', function () {
            AuthService.isAuthenticated(function (resp) {
              expect(resp).toBe(true);
            });
          });

          it('should get unread notifications', function () {
            AuthService.isAuthenticated(function () {
              expect(mockNotificationsService.getUnread).toHaveBeenCalled();
            });
          });

          it('should cache the users lists', function () {
            AuthService.isAuthenticated(function () {});
            $timeout.flush()
            expect(mockUserListsService.cacheListsForUser).toHaveBeenCalled();
          });

        });

        describe('token is nearly expired', function () {

          beforeEach(function () {
            setUpCtrl({exp: moment().add(1, 'hour').unix()});
          });

          it('should refresh the token', function () {
            AuthService.isAuthenticated();
            var expiry = moment().add(1, 'days').unix();

            httpBackend.expectPOST('http://mock-url/jsonwebtoken', {exp: expiry}).respond({});
            httpBackend.flush();
          });

          it('should authenticate', function () {
            var expiry = moment().add(1, 'days').unix();
            httpBackend.whenPOST('http://mock-url/jsonwebtoken', {exp: expiry}).respond({});
            AuthService.isAuthenticated(function (resp) {
              expect(resp).toBe(true);
            });
            httpBackend.flush();
          });

        });

  		});

  	});

  });

 })();
