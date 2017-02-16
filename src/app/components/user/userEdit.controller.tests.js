(function() {
  'use strict';

  describe('User edit controller', function () {

  	var countries, mockAlertService, mockConfig, mockGetText, mockhrinfoService, mockList, mockUserCheckInService, mockUserDataService, mockUser, scope, scopeUser, userFixture;

  	countries = ['france', 'uk'];

  	function setUpCtrl(user, currentUser) {
  		inject(function($rootScope, $controller, $injector, $q) {
  			scope = $rootScope.$new();
  			scopeUser = {};
  			scope.currentUser = currentUser;
  			scope.setCurrentUser = function () {};
        scopeUser = user;
  			scopeUser.$update = function () {};
  			scopeUser.$delete = function () {};
  			scope.user = scopeUser;

  			mockhrinfoService.getCountries = function () {
          var defer = $q.defer();
          defer.resolve(countries);
          return defer.promise;
        };

        mockhrinfoService.getRoles = function () {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        };

	      spyOn(scopeUser, '$update').and.callFake(function (callback) {
	      	callback();
	      });
	      spyOn(scopeUser, '$delete').and.callFake(function (callback) {
	      	callback();
	      });

	      spyOn(scope, '$emit').and.callThrough();
	      
  			$controller('UserEditCtrl', {
          $scope: scope
         });
        scope.$digest();
  		});
  	}

  	beforeEach(function() {
  		userFixture = readJSON('app/test-fixtures/user.json');
  		mockAlertService = {};
  		mockUserDataService = {};
  		mockUserCheckInService = {};
  		mockGetText = {};
  		mockhrinfoService = {};
  		mockConfig = {};
  		mockConfig.listTypes = ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office'];

  		module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.constant('UserDataService', mockUserDataService);
        $provide.value('UserCheckInService', mockUserCheckInService);
      });
      mockUserDataService.getUser = function () {};
      mockUserDataService.formatUserLocations = function () {};
      spyOn(mockUserDataService, 'formatUserLocations').and.callThrough();

      mockUserCheckInService.save = function () {};
      mockUserCheckInService.delete = function () {};
      spyOn(mockUserCheckInService, 'save').and.callThrough();
      spyOn(mockUserCheckInService, 'delete').and.callThrough();

      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
        $provide.value('hrinfoService', mockhrinfoService);
      });
      mockAlertService.add = function () {};
      spyOn(mockAlertService, 'add').and.callFake(function (argument1, argument2, arg3, callback) {
        	callback([argument1, argument2, arg3]);
      });
      // spyOn(mockAlertService, 'add').and.callThrough();

      mockGetText = {};
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });
      mockGetText.getString = function () {};

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });
      mockList.query = function () {};
     
      
  	});

  	describe('Adding a new item', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'job_title';
        scope.temp[key] = 'new job title';
        scope.addItem(key);
      });

      it('should add the new item to the user', function () {
        expect(scope.user.job_titles).toEqual(['new job title']);
      });

      it('should reset the temporary item', function () {
        expect(scope.temp.job_title).toEqual('');
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addjob_title',
          message: undefined
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Adding an empty item', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        var key = 'job_title';
        scope.temp[key] = '';
        scope.addItem(key);
      });

      it('should not update the user', function () {
        expect(scopeUser.$update).not.toHaveBeenCalled();
      });

    });

    describe('Adding a new organization', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'organization';
        scope.temp[key] = {_id: '3454', list: {_id: '999'}};
        scope.addItem(key);
      });

      it('should call the user checkin service', function () {
        expect(mockUserCheckInService.save).toHaveBeenCalled();
      });

    });

    describe('Adding a wesbite', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.user.websites = [];
      });

      it('should add http if the url does not start with http or https', function () {
        scope.temp.website.url = 'www.my-url.com';
        scope.addItem('website');
        expect(scope.user.websites[0]).toEqual({url: 'http://www.my-url.com'});
      });

      it('should not add http if the url starts with http', function () {
        scope.temp.website.url = 'http://www.my-url2.com';
        scope.addItem('website');
        expect(scope.user.websites[0]).toEqual({url: 'http://www.my-url2.com'});
      }); 

      it('should not add http if the url starts with https', function () {
        scope.temp.website.url = 'https://www.my-url3.com';
        scope.addItem('website');
        expect(scope.user.websites[0]).toEqual({url: 'https://www.my-url3.com'});
      }); 
    });

    describe('Removing an item', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.user.job_titles = ['new job title', 'web developer'];
        scope.$emit('userLoaded');

        var key = 'job_title';
        var value = 'new job title';
        scope.dropItem(key, value);
      });

      it('should remove the item from the user', function () {
        expect(scope.user.job_titles).toEqual(['web developer']);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

    });

    describe('Removing an organization', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'organization';
        var value = {_id: '7664'};
        scope.dropItem(key, value);
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalled();
      });

      it('should remove the item from the user', function () {
        expect(scope.user.organizations).toEqual([{_id: '3456'}]);
      });

      it('should update the user', function () {
        expect(mockUserCheckInService.delete).toHaveBeenCalled();
      });

    });

  	describe('Contact permissions', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.phonesVisibility = 'verified';
        scope.changePermission('phonesVisibility');
      });

      it('should update the permission on the user', function () {
        expect(scope.user.phonesVisibility).toEqual('verified');
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'phonesVisibility',
          message: undefined
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

  });

 })();

// TO DO:

// - on init:
//   - get countries
//   - get roles
//   - get primary location id
// - set primary org
// - set primary location
// - set primary job title
// - set primary email
// - set primary phone
// - resend validation email
// - update user
