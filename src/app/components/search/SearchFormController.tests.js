(function() {
  'use strict';

  describe('SearchFormController', function () {

    var scope, mockSearchService, mockUser, mockList, mockRoute, searchResults, $location, userFixture;
    userFixture = readJSON('app/test-fixtures/user.json');

    searchResults = [
      [
        {
          _id: '123'
        }
      ],
      [
        {
          _id: '3446'
        }
      ]
    ];


    beforeEach(function() {
      module('app.search');

      mockUser = jasmine.createSpyObj('User', ['query']);
      mockRoute = {
        reload: function () {}
      };
      mockSearchService = {};
      mockSearchService = {
        saveSearch: function () {}
      }
      spyOn(mockSearchService, 'saveSearch').and.callFake(function (arg1, arg2, arg3, callback) {
        callback(userFixture.user1);
      });
      module('app.search', function($provide) {
        $provide.value('SearchService', mockSearchService);
        $provide.value('$route', mockRoute);
      });

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      inject(function($rootScope, $q, $controller, _$location_) {
        scope = $rootScope.$new();
        scope.currentUser = {_id: 1}
        $location = _$location_;

        mockSearchService.UsersAndLists = function () {
          var defer = $q.defer();
          defer.resolve(searchResults);
          return defer.promise;
        };

        scope.setCurrentUser = function () {};
        spyOn(scope, 'setCurrentUser').and.callThrough();


        spyOn(mockSearchService, 'UsersAndLists').and.callThrough();
        spyOn($location, 'search').and.callThrough();

        $controller('SearchFormController', {
          $scope: scope,
          User: mockUser
        });

        scope.$digest();

      });

    });

    describe('Header search autocomplete', function () {

      describe('Invalid search term', function () {

        it('should not search and not show the autocomplete dropdown if there is no search term', function () {
          scope.searchTerm = '';
          scope.searchAutocomplete();
          expect(mockSearchService.UsersAndLists).not.toHaveBeenCalled();
          expect(scope.showAutocomplete).toBe(false);
        });

        it('should not search if the search term is shorter than the minimum length', function () {
          scope.searchTerm = 'ab';
          scope.searchAutocomplete();
          expect(mockSearchService.UsersAndLists).not.toHaveBeenCalled();
          expect(scope.showAutocomplete).toBe(false);
        });

      });

      describe('Valid search term', function () {

        it('should search for users and lists that match the search term', function () {
          scope.searchTerm = 'Kathleen';
          scope.searchAutocomplete();
          scope.$digest();
          expect(mockSearchService.UsersAndLists).toHaveBeenCalledWith('Kathleen', 3, scope.currentUser);
        });

        it('should add the returned users and lists to the scope and show the autocomplete dropdown', function () {
          scope.searchTerm = 'Kathleen';
          scope.searchAutocomplete();
          scope.$digest();
          expect(scope.searchLists).toEqual(searchResults[0]);
          expect(scope.searchPeople).toEqual(searchResults[1]);
          expect(scope.showAutocomplete).toBe(true);
        });

      });

    });

    describe('Full Search', function () {

      it('should redirect to the search path with the search term when the search form is submitted', function () {
        scope.fullSearch('Hanna');
        expect($location.search).toHaveBeenCalledWith({q: 'Hanna'});
      });

    });

    describe('Saving a search', function () {

     it('should save the search when the user selects it', function () {
       scope.saveSearch({_id: 1}, 'operation');
       expect(mockSearchService.saveSearch).toHaveBeenCalledWith(scope.currentUser, {_id: 1}, 'operation', jasmine.any(Function));
       expect(scope.setCurrentUser).toHaveBeenCalledWith(userFixture.user1);
     });

    });

  });
})();
