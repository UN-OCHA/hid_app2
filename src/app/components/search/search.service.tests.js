(function() {
  'use strict';

  describe('Search service', function () {

  	var $rootScope, existingMetaData, expectedParams, List, listFixture, mockList, mockUser, newSearch, newSearchSaved,
  	returnedSearches, savedSearches, SearchService, user, User, userFixture;

  	beforeEach(function () {
  		module('app.search');
  		userFixture = readJSON('app/test-fixtures/user.json');
      listFixture = readJSON('app/test-fixtures/list.json');

      savedSearches = [
				{id: '1', name: 'haiti', link: 'lists/1'},
				{id: '2', name: 'nepal', link: 'lists/2'},
				{id: '3', name: 'three', link: 'lists/3'},
				{id: '4', name: 'four', link: 'lists/4'},
				{id: '5', name: 'five', link: 'lists/5'}
			];
			newSearch = {_id: '22', name: 'sheffield'};
			newSearchSaved = {id: '22', name: 'sheffield', link: 'lists/22'};
			existingMetaData = {
				hid: {
					recentSearches: {
	  				operation: [],
	  				user: [],
	  				list: []
	  			}
				}
			};
			expectedParams = {
				recentSearches: {
		  		operation: [],
		  		user: [],
		  		list: []
		  	}
		  };

      user = userFixture.user1;
      user.setAppMetaData = function () {};
      user.$update = function () {};

      spyOn(user, 'setAppMetaData').and.callThrough();
      spyOn(user, '$update').and.callFake(function(callback) {
      	callback();
      });

  		mockList = {};
      mockList.query = function () {};
      mockUser = {
        get: function () {},
        query: function () {}
      };

      spyOn(mockUser, 'get').and.callFake(function(arg, callback) {
        callback(user);
      })

      module('app.list', function($provide) {
        $provide.constant('List', mockList);
      });

      module('app.user', function($provide) {
        $provide.constant('User', mockUser);
      });

  		inject(function(_SearchService_, $q, _$rootScope_) {
        $rootScope = _$rootScope_;
        SearchService = _SearchService_;
        List = mockList;
        User = mockUser;

        spyOn(mockList, 'query').and.returnValue(
          {$promise: $q.when([listFixture.lists[0]])}
        );
        spyOn(mockUser, 'query').and.returnValue(
          {$promise: $q.when([userFixture.user2])}
        );
      });

  	});

  	describe('Searching users and lists', function () {
  		beforeEach(function () {
  			SearchService.UsersAndLists('findme', 10, {_id: 1}).then(function (r) {
  				returnedSearches = r;
  			});
  		});

  		it('should get the lists that match the search term', function () {
  			expect(List.query).toHaveBeenCalledWith({name: 'findme', limit: 10, sort: 'name'});
  		});

  		it('should get the users that match the search term', function () {
  			expect(User.query).toHaveBeenCalledWith({q: 'findme', limit: 10, sort: 'name', authOnly: false});
  		});

  		it('should return the matching users and lsits', function () {
  			$rootScope.$apply();
  			expect(returnedSearches).toEqual([[listFixture.lists[0]], [userFixture.user2]]);
  		});

  	});

  	describe('Saving searches', function () {

  		describe('The search is already saved', function () {

  			beforeEach(function () {
	  			user.appMetadata = existingMetaData;
  				user.appMetadata.hid.recentSearches.operation = [savedSearches[0],savedSearches[1], newSearchSaved];
	  			SearchService.saveSearch(user, newSearch, 'operation', function () {});
  			});

	  		it('should not save the search if it is already saved', function () {
	  			expect(user.setAppMetaData).not.toHaveBeenCalled();
	  			expect(user.$update).not.toHaveBeenCalled();
	  		});

  		});

  		describe('Saving a new search', function () {

  			describe('User already has some saved searches', function () {

  				it('should format the link and add save the search', function () {
  					user.appMetadata = existingMetaData;
  					user.appMetadata.hid.recentSearches.operation = [savedSearches[0],savedSearches[1]];

		  			SearchService.saveSearch(user, newSearch, 'operation', function () {});
					  expectedParams.recentSearches.operation = [newSearchSaved, savedSearches[0],savedSearches[1]];

            expect(mockUser.get).toHaveBeenCalledWith({ userId: userFixture.user1._id }, jasmine.any(Function), jasmine.any(Function));
		  			expect(user.setAppMetaData).toHaveBeenCalledWith(expectedParams);
		  			expect(user.$update).toHaveBeenCalled();
  				});

  				it('should remove the oldest search of the type if there are already 5', function () {
		  			user.appMetadata = existingMetaData;
  					user.appMetadata.hid.recentSearches.list = [savedSearches[0],savedSearches[1],savedSearches[2],savedSearches[3],savedSearches[4]];
		  			SearchService.saveSearch(user, newSearch, 'list', function () {});
		  			expectedParams.recentSearches.list = [newSearchSaved, savedSearches[0],savedSearches[1],savedSearches[2],savedSearches[3]];

		  			expect(user.setAppMetaData).toHaveBeenCalledWith(expectedParams);
		  			expect(user.$update).toHaveBeenCalled();
  				});

  			});

  		});

  	});

  });

})();
