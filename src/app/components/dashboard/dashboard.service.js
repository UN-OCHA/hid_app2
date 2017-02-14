(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .factory('DashboardService', DashboardService);

  DashboardService.$inject = ['$rootScope', '$exceptionHandler', 'config', 'List', 'offlineService'];

  function DashboardService($rootScope, $exceptionHandler, config, List, offlineService) {
  	var dashboardService = {};
  	dashboardService.favoriteLists = [];
  	dashboardService.listsMember = [];

  	function updateCacheStatus (list) {
  		var cachedList = offlineService.cachedLists.find(function(cachedList) {
				return cachedList._id === list._id;
			});
			if (cachedList) {
				list.cacheStatus = cachedList.status;
			}
			return list;
  	}

  	dashboardService.getFavoriteLists = function (user) {
  		if (!user) {
  			return;
  		}
  		var lists = user.favoriteLists;
  		angular.forEach(lists, function (list) {  			
  			updateCacheStatus(list);
  		});
  		dashboardService.favoriteLists = lists;
  	};

  	dashboardService.getListsMember = function (user) {
  		var lists = [];
  		angular.forEach(config.listTypes, function (listType) {
	      angular.forEach(user[listType + 's'], function (val) {
	        var listId = val.list;
	        if (typeof val.list === "object") {
	          listId = val.list._id;
	        }
	        List.get({listId: listId}, function (list) {
	          updateCacheStatus(list);
	          lists.push(list);
	        });
	      });
	    });
	    dashboardService.listsMember = lists;
  	};

  	dashboardService.updateListsCacheStatus = function () {
  		angular.forEach(dashboardService.listsMember, function (list) {
	  		updateCacheStatus(list);
	  	});
	  	angular.forEach(dashboardService.favoriteLists, function (list) {
	  		updateCacheStatus(list);
	  	});
  	};
  
  	return dashboardService;

  }

})();
