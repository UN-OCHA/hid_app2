(function() {
  'use strict';

  describe('List data service', function () {

  	var $rootScope, gotLists, headers, ListDataService, listFixture, managedLists, mockList, mockLf, mockLocalForage, ownedLists, 
  	ownedManagedLists, returnedLists, userFixture;

  	userFixture = readJSON('app/test-fixtures/user.json');
  	listFixture = readJSON('app/test-fixtures/list.json');

  	ownedLists = [listFixture.lists[0], listFixture.lists[1] ,listFixture.lists[2], listFixture.lists[3]];
  	managedLists = [listFixture.lists[2], listFixture.lists[3], listFixture.lists[4]];
  	ownedManagedLists = [listFixture.lists[0], listFixture.lists[1] ,listFixture.lists[2], listFixture.lists[3], listFixture.lists[4]];
  	gotLists = listFixture.lists;
  	headers = function () {
			return {
				'x-total-count': 10
			};
		};

  	beforeEach(function () {

  		mockList = {
  			query: function () {}
  		};

  		mockLocalForage = {};
  		
  		module('app.list', function($provide) {
  			$provide.constant('$localForage', mockLocalForage);
  			$provide.constant('List', mockList);
  		});

  		inject(function(_ListDataService_, _$rootScope_, $localForage, $q) {
  			ListDataService = _ListDataService_;
  			$rootScope = _$rootScope_;
  			$localForage = mockLocalForage;

  			mockLf = {
	  			iterate: function () {
	  				var deferred = $q.defer();
	  				deferred.resolve();
	  				return deferred.promise;
	  			},
	  			length: function () {
	  				var deferred = $q.defer();
	  				deferred.resolve(4);
	  				return deferred.promise;
	  			}
	  		};
	  		
	  		mockLocalForage.instance = function () {
	  			return mockLf;
	  		};
	  		spyOn(mockLocalForage, 'instance').and.callThrough();

	  		spyOn(mockLf, 'iterate').and.callThrough();
	  		spyOn(mockLf, 'length').and.callThrough();

  			spyOn(mockList, 'query').and.callFake(function(params, callback, failCallback) {
					if (params.owner) {
  					callback(ownedLists);
  					return;
  				}
  				if (params.managers) {
  					callback(managedLists);
  					return;
  				}
  				if (params.fakeOffline) {
  					failCallback();
  					return;
  				}
  				
  				callback(gotLists, headers);
  			});

  		});

  	});

  	describe('Get lists', function () {

  		it('should get the lists', function () {
  			var fakeCallback = jasmine.createSpy('cb');
  			ListDataService.queryLists({limit: 50}, fakeCallback);
  			expect(mockList.query).toHaveBeenCalledWith({limit: 50}, jasmine.any(Function), jasmine.any(Function));
  			expect(fakeCallback).toHaveBeenCalledWith(listFixture.lists, 10);
  		});

  		it('should get lists from localForage if offline', function () {
  			var fakeCallback = jasmine.createSpy('cb');
  			ListDataService.queryLists({fakeOffline: true}, fakeCallback);
  			expect(mockLocalForage.instance).toHaveBeenCalledWith('lists');
  			expect(mockLf.iterate).toHaveBeenCalled();
  			$rootScope.$digest();
  			expect(mockLf.length).toHaveBeenCalled();
  			expect(fakeCallback).toHaveBeenCalled();
  		});

  	});

  	describe('Get a user\'s managed and ownedLists', function () {

  		describe('All owned and managed lists', function () {
  			beforeEach(function () {
  				returnedLists = [];
  				ListDataService.getManagedAndOwnedLists(userFixture.user1, '', function (lists){
  					returnedLists = lists;
  				});
  			});

  			it('should get the lists the user is owner of', function () {
  				expect(mockList.query).toHaveBeenCalledWith({'owner': userFixture.user1._id}, jasmine.any(Function));
  			});

  			it('should get the lists the user is manager of', function () {
  				$rootScope.$digest();
  				expect(mockList.query).toHaveBeenCalledWith({'managers': userFixture.user1._id}, jasmine.any(Function));
  			});

  			it('should remove duplicate lists', function () {
  				expect(returnedLists).toEqual(ownedManagedLists);
  			});

  		});

  		describe('Owned and managed lists that match a search term', function () {
  			beforeEach(function () {
  				returnedLists = [];
  				ListDataService.getManagedAndOwnedLists(userFixture.user1, 'findme', function (lists){
  					returnedLists = lists;
  				});
  			});

  			it('should get the lists the user is owner of', function () {
  				expect(mockList.query).toHaveBeenCalledWith({'owner': userFixture.user1._id, name: 'findme'}, jasmine.any(Function));
  			});

  			it('should get the lists the user is manager of', function () {
  				$rootScope.$digest();
  				expect(mockList.query).toHaveBeenCalledWith({'managers': userFixture.user1._id, name: 'findme'}, jasmine.any(Function));
  			});

  			it('should remove duplicate lists', function () {
  				expect(returnedLists).toEqual(ownedManagedLists);
  			});
  		});

  	});

  	describe('Get the display list type for a list', function () {
  		it('should add the display type to the list', function () {
  			expect(ListDataService.setListTypeLabel({_id: '1', type: 'office'})).toEqual({_id: '1', displayType: 'Co-ordination hub', type: 'office'});
  		});
  	});

  });
 })();
