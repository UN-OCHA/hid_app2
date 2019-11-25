(function() {
  'use strict';

  describe('ListsController', function () {

  	var listFixture, mockListDataService, scope;

  	function setUpCtrl () {

  		inject(function($rootScope, $controller) {
      	scope = $rootScope.$new();

      	ctrlParams = {
          $scope: scope,
          $routeParams: {},
          $localForage: mockLocalForage
        };

        $controller('ListsController', ctrlParams);
        scope.$digest();
      });

      beforeEach(function () {
    		listFixture = readJSON('app/test-fixtures/list.json');

    		module('app.list', function($provide) {
        	$provide.value('ListDataService', mockListDataService);
		    });

    	});

    	describe('', function() {

    		it('should', function () {

    		});

    	});

    	describe('', function() {

    		it('should', function () {

    		});

    	});
  	}

  });
})();
