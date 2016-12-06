describe('Search Form controller', function () {

  'use strict';

  var scope, mockSearch, mockUser, mockList, searchResults, $location;

  var searchResults = [
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
    module('hidApp');

    mockUser = jasmine.createSpyObj('User', ['query']);

    mockSearch = {};
    module('appServices', function($provide) {
      $provide.value('Search', mockSearch);
    });

    inject(function($rootScope, $q, $controller, _$location_) {
      scope = $rootScope.$new();
      $location = _$location_;

      mockSearch.UsersAndLists = function () {
        var defer = $q.defer();
        defer.resolve(searchResults);
        return defer.promise;
      }


      spyOn(mockSearch, 'UsersAndLists').and.callThrough();
      spyOn($location, 'search').and.callThrough();

      $controller('SearchFormCtrl', {
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
        expect(mockSearch.UsersAndLists).not.toHaveBeenCalled();
        expect(scope.showAutocomplete).toBe(false);
      });

      it('should not search if the search term is shorter than the minimum length', function () {
        scope.searchTerm = 'ab';
        scope.searchAutocomplete();
        expect(mockSearch.UsersAndLists).not.toHaveBeenCalled();
        expect(scope.showAutocomplete).toBe(false);
      });

    });

    describe('Valid search term', function () {

      it('should search for users and lists that match the search term', function () {
        scope.searchTerm = 'Kathleen';
        scope.searchAutocomplete();
        scope.$digest();
        expect(mockSearch.UsersAndLists).toHaveBeenCalledWith('Kathleen', 3);
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

});
