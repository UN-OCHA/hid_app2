(function() {
  'use strict';

  describe('Auth controller', function () {

  	var authUser, hidV1FirstLoginUser, $location, mockAlertService, mockAuthService, mockGetText, mockTwoFactorAuthService,
    newUser, returnUser, scope, tfaToken, tfaUser;

  	newUser = {
  		_id: 1,
  		appMetadata: {
  			hid: {
  				login: false
  			}
  		}
  	};

  	hidV1FirstLoginUser = {
  		_id: 2,
  		appMetadata: {
  			hid: {
  				login: true
  			}
  		}
  	};

  	returnUser = {
  		_id: 3,
  		appMetadata: {
  			hid: {
  				login: true,
  				viewedTutorial: true
  			}
  		}
  	};

    authUser = {
      _id: 4
    };

    tfaToken = '123456';

    tfaUser = {
      _id: 5,
      totp: true
    };

  	beforeEach(function() {

  		mockAuthService = {};
      module('app.auth', function($provide) {
        $provide.value('AuthService', mockAuthService);
      });

      mockAlertService = {
        pageAlert: function () {}
      };
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });
      mockAlertService.add = function () {};
      spyOn(mockAlertService, 'add').and.callFake(function (argument1, argument2, arg3, callback) {
         callback();
      });

      mockGetText = {};
      mockGetText.getString = function (str) {
        return str;
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockTwoFactorAuthService = {};
      module('app.user', function($provide) {
        $provide.value('TwoFactorAuthService', mockTwoFactorAuthService);
      });
      mockTwoFactorAuthService.requestToken = function () {};
      spyOn(mockTwoFactorAuthService, 'requestToken').and.callFake(function (callback) {
        callback(tfaToken, true);
      });
      mockTwoFactorAuthService.trustDevice = function () {};
      spyOn(mockTwoFactorAuthService, 'trustDevice').and.callFake(function (arg, callback) {
        callback();
      });

    });

    function setUpController (currentUser, tfaRequired) {
    	inject(function($controller, $q, $rootScope, _$location_) {
      	scope = $rootScope.$new();
      	$location = _$location_;

      	mockAuthService.login = function () {
      		var deferred = $q.defer();
          if (tfaRequired) {
            deferred.resolve({data: {statusCode: 401, message: 'No TOTP token'}});
          } else {
      		  deferred.resolve();
          }
      		return deferred.promise;
      	};

      	$controller('AuthCtrl', {
      		$scope: scope
      	});

      	scope.email = 'email@email.com';
      	scope.password = 'a password';
      	scope.currentUser = currentUser || {};
      	scope.currentUser.setAppMetaData = function () {};
      	scope.currentUser.$update = function () {};
      	scope.initCurrentUser = function () {};
				scope.setCurrentUser = function () {};
      	spyOn(mockAuthService, 'login').and.callThrough();
      	spyOn($location, 'path').and.callThrough();
      	spyOn(scope.currentUser, '$update').and.callFake(function (callback) {
           callback();
        });
        spyOn(scope.currentUser, 'setAppMetaData').and.callThrough();
        spyOn(scope, 'setCurrentUser').and.callThrough();
      	scope.$digest();
      });
    }

    describe('Login', function () {

    	it('should log the user in', function () {
    		setUpController();
    		scope.login();
    		expect(mockAuthService.login).toHaveBeenCalledWith('email@email.com', 'a password', undefined);
    	});

    	describe('Set path and metaData', function () {

    		describe('A new user on their first login', function () {
    			beforeEach(function () {
    				setUpController(newUser);
    				scope.login();
    				scope.$digest();
    			});

    			it('should set appMetadata login to true', function () {
    				expect(scope.currentUser.setAppMetaData).toHaveBeenCalledWith({login: true});
    			});

    			it('should update the user', function () {
    				expect(scope.currentUser.$update).toHaveBeenCalled();
    			});

    			it('should set the current user', function () {
    				expect(scope.setCurrentUser).toHaveBeenCalled();
    			});

    			it('should go to the start page', function () {
    				expect($location.path).toHaveBeenCalledWith('/start');
    			});
    		});

    		describe('A HID v1 user on their first login', function () {
    			beforeEach(function () {
    				setUpController(hidV1FirstLoginUser);
    				scope.login();
    				scope.$digest();
    			});

    			it('should go to the tutorial', function () {
    				expect($location.path).toHaveBeenCalledWith('/tutorial');
    			});
    		});

        describe('A user who registered using auth on their first login', function () {
          beforeEach(function () {
            setUpController(authUser);
            scope.login();
            scope.$digest();
          });

          it('should set appMetadata login to true', function () {
            expect(scope.currentUser.setAppMetaData).toHaveBeenCalledWith({login: true});
          });

          it('should set authOnly to false', function () {
            expect(scope.currentUser.authOnly).toBe(false);
          });

          it('should update the user', function () {
            expect(scope.currentUser.$update).toHaveBeenCalled();
          });

          it('should set the current user', function () {
            expect(scope.setCurrentUser).toHaveBeenCalled();
          });

          it('should go to the start page', function () {
            expect($location.path).toHaveBeenCalledWith('/start');
          });
        });

    		describe('A user on subsequent logins', function () {
    			beforeEach(function () {
    				setUpController(returnUser);
    				scope.login();
    				scope.$digest();
    			});

    			it('should go to the landing page', function () {
    				expect($location.path).toHaveBeenCalledWith('/landing');
    			});
    		});

    	});

      describe('With Two Factor Auth enabled', function () {
        beforeEach(function () {
          setUpController(returnUser, true);
          scope.login();
          scope.$digest();
        });

        it('should request the token', function () {
          expect(mockTwoFactorAuthService.requestToken).toHaveBeenCalled();
        });

        it('should log the user in', function () {
          expect(mockAuthService.login).toHaveBeenCalledWith('email@email.com', 'a password', tfaToken);
        });

        it('should set the device as trusted', function () {
          expect(mockTwoFactorAuthService.trustDevice).toHaveBeenCalledWith(tfaToken, jasmine.any(Function), jasmine.any(Function));
        });
      });

    });

  });

})();
