(function() {
  'use strict';

  describe('User preferences controller', function () {

  	var connection, mockAlertService, mockAuthService, mockGetText, mockUserDataService, newToken, returnedTokens, scope,
  	scopeUser, showTokens, userFixture;

  	newToken = {id: 4, blacklist: false, token: '124324'};
  	returnedTokens = [{id: 1, blacklist: false}, {id: 2, blacklist: true}, {id: 3, blacklist: false}];
  	showTokens = [{id: 1, blacklist: false}, {id: 3, blacklist: false}];

  	beforeEach(function() {
  		userFixture = readJSON('app/test-fixtures/user.json');

  		mockAlertService = {};
	    module('app.common', function($provide) {
	      $provide.value('alertService', mockAlertService);
	    });
	    mockAlertService.add = function () {};
	    spyOn(mockAlertService, 'add').and.callFake(function (a1, a2, a3, callback) {
        callback();
      });

      mockAuthService = {
      	getUserTokens: function () {},
      	generateAPIToken: function () {},
      	deleteToken: function () {}
      };
      spyOn(mockAuthService, 'getUserTokens').and.callFake(function (callback) {
      	callback(returnedTokens);
      });
      spyOn(mockAuthService, 'generateAPIToken').and.callFake(function (callback) {
      	callback(newToken);
      });
      spyOn(mockAuthService, 'deleteToken').and.callFake(function (token, callback) {
      	callback();
      });
	    module('app.common', function($provide) {
	      $provide.value('AuthService', mockAuthService);
	    });

	    mockUserDataService = {};
	    module('app.user', function($provide) {
	      $provide.value('UserDataService', mockUserDataService);
	    });
	    mockUserDataService.getUser = function () {};

	    mockGetText = {};
      mockGetText.getString = function (str) {
      	return str;
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

	    inject(function($rootScope, $controller) {
	    	scope = $rootScope.$new();
	    	scope.currentUser = {};
	    	scope.currentUser._id = userFixture.user1._id;
	    	scope.setCurrentUser = function () {};
	    	scopeUser = userFixture.user1;
	    	scopeUser.approveConnection = function () {};
	    	scopeUser.deleteConnection = function () {};

	    	spyOn(mockUserDataService, 'getUser').and.callFake(function (arg, callback) {
	      	mockUserDataService.user = scopeUser;
	      	callback();
	      });

	      spyOn(scopeUser, 'approveConnection').and.callFake(function(arg1, arg2, callback) {
	      	callback();
	      });
	      spyOn(scopeUser, 'deleteConnection').and.callFake(function(arg1, arg2, callback) {
	      	callback();
	      });

	      spyOn(scope, 'setCurrentUser').and.callThrough();

	    	$controller('UserPrefsCtrl', {
	        $scope: scope,
	      });
	      scope.$digest();

	    });

	  });

	  describe('Managing connections', function () {

  		describe('Viewing connections', function () {

	  		it('should display pending connections', function () {
	  			expect(scope.pendingConnections.length).toBe(2);
	  			expect(scope.pendingConnections[0].pending).toBe(true);
	  			expect(scope.pendingConnections[1].pending).toBe(true);
	  		});

	  		it('should display approved connections', function () {
	  			expect(scope.approvedConnections.length).toBe(2);
	  			expect(scope.approvedConnections[0].pending).toBe(false);
	  			expect(scope.approvedConnections[1].pending).toBe(false);
	  		});

	  	});

	  	describe('Approving connections', function () {

	  		beforeEach(function () {
	  			connection = userFixture.user1.connections[1];
	  			scope.approveConnection(connection);
	  		});

	  		it('should approve the connection', function () {
	  			expect(scopeUser.approveConnection).toHaveBeenCalledWith(userFixture.user1._id, connection._id, jasmine.any(Function), jasmine.any(Function));
	  		});

	  		it('should show a confirmation message', function () {
	  			expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Connection approved', false, jasmine.any(Function));
	  		});

	  		it('should show the approved connection in the approved connections list', function () {
	  			expect(scope.approvedConnections.length).toBe(3);
	  			expect(scope.approvedConnections[1]).toEqual(userFixture.user1.connections[1]);
	  		});

	  		it('should update the user', function () {
	  			expect(scope.setCurrentUser).toHaveBeenCalledWith(scopeUser);
	  		});

	  	});

	  	describe('Removing connections', function () {

	  		beforeEach(function () {
	  			connection = userFixture.user1.connections[0];
	  			scope.removeConnection(connection);
	  		});

	  		it('should remove the connection', function () {
	  			expect(scopeUser.deleteConnection).toHaveBeenCalledWith(userFixture.user1._id, connection._id, jasmine.any(Function), jasmine.any(Function));
	  		});

	  		it('should show a confirmation message', function () {
	  			expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Connection removed', false, jasmine.any(Function));
	  		});

	  		it('should remove the connection from the approved connections list', function () {
	  			expect(scope.approvedConnections.length).toBe(1);
	  		});

	  		it('should update the user', function () {
	  			expect(scope.setCurrentUser).toHaveBeenCalledWith(scopeUser);
	  		});

	  	});
  	});

  	describe('Managing API keys', function () {

  		it('should get the users api keys', function () {
  			expect(mockAuthService.getUserTokens).toHaveBeenCalled();
  		});

  		it('should add non-blacklisted api keys to the view', function () {
  			expect(scope.tokens).toEqual(showTokens);
  		});

  		describe('Adding a new api key', function () {

	  		it('should get a new key', function () {
	  			scope.newToken();
	  			expect(mockAuthService.generateAPIToken).toHaveBeenCalled();
	  		});

	  		it('should flag the new token as new and add it to the view', function () {
	  			scope.newToken();
	  			expect(scope.tokens).toContain(newToken);
	  			expect(scope.tokens[0].new).toBe(true);
	  		});

  		});

  		describe('Deleting an  api key', function () {

  			it('should delete the key', function () {
	  			scope.deleteToken(newToken);
	  			expect(mockAuthService.deleteToken).toHaveBeenCalledWith(newToken.token, jasmine.any(Function));
	  		});

	  		it('should remove the key from thew view', function () {
	  			scope.deleteToken(newToken);
	  			expect(scope.tokens).not.toContain(newToken);
	  		});

  		});

  	});

    describe('Two-Factor Authentication', function () {

      it('should enable @FA', function () {
        scope.enable2FA();
        expect(mock2FAService.generateQRCode).toHaveBeenCalled();
      });

    });

  });
})();
