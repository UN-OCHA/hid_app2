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
	  		userFixture.user1.organizations = [{_id: "some-checkin-id", name: "list-3", list: "3"}];
	  		DashboardService.getListsMember(userFixture.user1);
  		});

      it('should transform and add cache status to the lists the user is a member of', function () {
        expect(DashboardService.listsMember).toEqual([{_id: "3", name: "list-3", type: "organization", checkinId: 'some-checkin-id', cacheStatus: 'caching'}]);
      });   

  	});

  });

 })();
