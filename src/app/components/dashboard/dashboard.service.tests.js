(function() {
  'use strict';

  describe('Dashboard service', function () {

  	var $rootScope, DashboardService, expectedFavouriteLists, List, mockConfig, mockList, mockOfflineService, userFixture;

  	beforeEach(function () {
  		userFixture = readJSON('app/test-fixtures/user.json');
  		mockConfig = {};
  		mockConfig.listTypes = ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office'];
  		mockList = {};
  		mockList.get = function () {};
  		mockOfflineService = {};
  		mockOfflineService.cachedLists = [{_id: "1", status: 'caching'}, {_id: "2", status: 'cached'}, {_id: "3", status: 'caching'}];
  		expectedFavouriteLists = [{_id: "1", cacheStatus: 'caching'}, {_id: "2", cacheStatus: 'cached'}];

  		module('app.dashboard', function($provide) {
  			$provide.constant('config', mockConfig);
  		});

  		module('app.list', function($provide) {
  			$provide.constant('List', mockList);
  		});
  		module('app.common', function($provide) {
  			$provide.constant('offlineService', mockOfflineService);
  		});

  		spyOn(mockList, 'get').and.callFake(function(arg, callback) {
  			callback({_id: "3"});
  		});
  		
  		inject(function(_DashboardService_, _List_, config, $q, _$rootScope_) {
	    	$rootScope = _$rootScope_;
	    	DashboardService = _DashboardService_;
	      List = mockList;
	      config = mockConfig;
	    });

  	});

  	describe('Favourite lists', function () {
  		it('should get the user\'s favourite lists and update the cache status for each', function () {
	  		DashboardService.getFavoriteLists(userFixture.user1);
	  		expect(DashboardService.favoriteLists).toEqual(expectedFavouriteLists);
	  	});
  	});

  	describe('Lists the user is a member of', function () {

  		beforeEach(function () {
  			userFixture.user1.lists = [];
	  		userFixture.user1.organizations = [{list: "3"}];
	  		DashboardService.getListsMember(userFixture.user1);
  		});

			it('should get the lists the user is a member of', function () {
	  		expect(mockList.get).toHaveBeenCalledWith({listId: "3"}, jasmine.any(Function));
	  	});  		

	  	it('should get the lists the user is a member of and update the cache status for each', function () {
	  		expect(DashboardService.listsMember).toEqual([{_id: "3", cacheStatus: 'caching'}]);
	  	}); 

  	});

  });

 })();
