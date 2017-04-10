(function() {
  'use strict';

  describe('List service', function () {

  	var $rootScope, httpBackend, List, listFixture, mockConfig, mockList, mockLocalForage, mockUser, initialParams, mockLf, 
  	nextPageParams, userFixture;
  	
  	listFixture = readJSON('app/test-fixtures/list.json');
  	userFixture = readJSON('app/test-fixtures/user.json');

  	beforeEach(function () {
  		module('ngResource'); 	
  		mockConfig = {};
  		mockConfig.apiUrl = 'http://mock-url/';
  		mockUser = {};
  		mockLocalForage = {};
  		
  		module('app.list', function($provide) {
  			$provide.constant('config', mockConfig);
  			$provide.constant('$localForage', mockLocalForage);
  		});
  		module('app.user', function($provide) {
  			$provide.constant('User', mockUser);
  		});

  		mockUser.query = function () {};

	    inject(function(_List_, _$httpBackend_, config, User, $localForage, $q, _$rootScope_) {
	    	$rootScope = _$rootScope_;
	      List = _List_;
	      httpBackend = _$httpBackend_;
	      config = mockConfig;
	      User = mockUser;
	      $localForage = mockLocalForage;

	      $rootScope.canCache = true;
	      mockList = new List();
	  		mockList._id = '1234';
	  		mockList.type = 'operation';

	  		mockLf = {
	  			setItem: function () {
	  				var deferred = $q.defer();
	  				deferred.resolve();
	  				return deferred.promise;
	  			}
	  		};

	  		mockLocalForage.instance = function () {
	  			return mockLf;
	  		};

	  		spyOn(mockLf, 'setItem').and.callThrough();
	      spyOn(mockUser, 'query').and.returnValues({$promise: $q.when(listFixture.firstPageOfUsers)}, { $promise: $q.when(listFixture.secondPageOfUsers)});
	    });

  	});

  	afterEach(function() {
	    httpBackend.verifyNoOutstandingExpectation();
	    httpBackend.verifyNoOutstandingRequest();
	  });

	  describe('API calls', function () {
	  	it('should call the correct api url', function () {
	      List.get({listId: '1234'});
	      httpBackend.expectGET('http://mock-url/list/1234').respond();
	      httpBackend.flush();
	    });
	  });

	  describe('Caching lists', function () {

	  	beforeEach(function () {	  		
	  		initialParams = { limit: 100, offset: 0, sort: 'name', 'operations.list': '1234', 'appMetadata.hid.login': true};
	  		nextPageParams = { limit: 100, offset: 100, sort: 'name', 'operations.list': '1234', 'appMetadata.hid.login': true};
	  		mockList.cache();
	  	});

	  	it('should store the list', function () {
	  		expect(mockLf.setItem).toHaveBeenCalledWith('1234', mockList);
	  	});

	  	it('should get the first 100 list users', function () {
	  		$rootScope.$digest();
	  		expect(mockUser.query).toHaveBeenCalled();
	  	});

	  	it('should store the users', function () {
	  		$rootScope.$digest();
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.firstPageOfUsers[0]._id, listFixture.firstPageOfUsers[0]);
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.firstPageOfUsers[99]._id, listFixture.firstPageOfUsers[99]);
	  	});

	  	it('should get the second page of users', function () {
	  		$rootScope.$digest();
	  		expect(mockUser.query).toHaveBeenCalledWith(nextPageParams);
	  	});

	  	it('should store the second page of users', function () {
	  		$rootScope.$digest();
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.secondPageOfUsers[0]._id, listFixture.secondPageOfUsers[0]); 
	  	});

	  });

	  describe('Checking if user is manager of a list', function () {

	  	it('should return true if user is a manager', function () {
	  		mockList.managers = [
		  		{
		  			_id: userFixture.user1._id
		  		}, {
		  			_id: userFixture.user2._id
		  		}
	  		];
	  		expect(mockList.isManager(userFixture.user1)).toBe(true);
	  	});

	  	it('should return false if user is not a manager', function () {
	  		mockList.managers = [
		  		{
		  			_id: userFixture.user2._id
		  		}
	  		];
	  		expect(mockList.isManager(userFixture.user1)).toBe(false);
	  	});

	  });

	  describe('Getting associated operations', function () {

	  	describe('List is an operation', function () {

	  		it('should return it\'s operation id', function () {
	  			mockList.type = 'operation';
	  			mockList.remote_id ='333';
	  			expect(mockList.associatedOperations()).toEqual(['333']);
	  		});

	  	});

	  	describe('List has associated operations', function () {

	  		it('should return the operation ids', function () {
	  			mockList.type = 'bundle';
	  			mockList.metadata = {
	  				operation: [
	  					{id: '23r4'},
	  					{id: '32'}
	  				]
	  			};
	  			expect(mockList.associatedOperations()).toEqual(['23r4', '32']);
	  		});

	  	});

	  	describe('List has notassociated operations', function () {

	  		it('should return', function () {
	  			mockList.type = 'bundle';
	  			mockList.metadata = {};
	  			expect(mockList.associatedOperations()).toBeUndefined();
	  		});

	  	});

	  });

  });

 })();
