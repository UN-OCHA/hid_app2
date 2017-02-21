(function() {
  'use strict';

  describe('List service', function () {

  	var $rootScope, httpBackend, List, listFixture, mockConfig, mockList, mockLocalForage, mockUser, initialParams, mockLf, nextPageParams;
  	
  	listFixture = readJSON('app/test-fixtures/list.json');

  	beforeEach(function () {
  		module('ngResource'); //need this?  		
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
	  		initialParams = { limit: 50, offset: 0, sort: 'name', 'operations.list': '1234'};
	  		nextPageParams = { limit: 50, offset: 50, sort: 'name', 'operations.list': '1234'};
	  		mockList.cache();
	  	});

	  	it('should store the list', function () {
	  		expect(mockLf.setItem).toHaveBeenCalledWith('1234', mockList);
	  	});

	  	it('should get the first 50 list users', function () {
	  		$rootScope.$digest();
	  		expect(mockUser.query).toHaveBeenCalled();
	  	});

	  	it('should store the users', function () {
	  		$rootScope.$digest();
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.firstPageOfUsers[0]._id, listFixture.firstPageOfUsers[0]);
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.firstPageOfUsers[49]._id, listFixture.firstPageOfUsers[49]);
	  	});

	  	it('should get the second page of users', function () {
	  		$rootScope.$digest();
	  		expect(mockUser.query).toHaveBeenCalledWith(nextPageParams);
	  	});

	  	it('should store the second page of users', function () {
	  		$rootScope.$digest();
	  		expect(mockLf.setItem).toHaveBeenCalledWith(listFixture.secondPageOfUsers[0]._id, listFixture.secondPageOfUsers[0]); //isn't being called for users....
	  	});

	  });

  });

 })();
