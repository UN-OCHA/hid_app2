(function() {
  'use strict';

  describe('Auth controller', function () {

  	var hidV1FirstLoginUser, $location, mockAlertService, mockAuthService, mockGetText, newUser, returnUser, scope;

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
    });

    function setUpController (currentUser) {
    	inject(function($controller, $q, $rootScope, _$location_) {
      	scope = $rootScope.$new();
      	$location = _$location_;

      	mockAuthService.login = function () {
      		var deferred = $q.defer();
      		deferred.resolve();
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
    		expect(mockAuthService.login).toHaveBeenCalledWith('email@email.com', 'a password');
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

    });

  });

})();
