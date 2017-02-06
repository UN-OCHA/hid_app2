(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchFormCtrl', SearchFormCtrl);

  SearchFormCtrl.$inject = ['$rootScope', '$scope', '$location', 'SearchService', 'User', 'List'];

  function SearchFormCtrl($rootScope, $scope, $location, SearchService, User, List) {

    $scope.searchTerm = '';
    $scope.searchUsersTerm = '';
    $scope.searchListsTerm = '';
    $scope.searchLists = [];
    $scope.searchPeople = [];
    $scope.showAutocomplete = false;
    $scope.showUsersAutocomplete = false;
    $scope.showListsAutocomplete = false;
    var minSearchLength = 3;
    var searchLimit = 3;

    $scope.searchAutocomplete = function() {

      if ($scope.searchTerm.length < minSearchLength) {
        $scope.showAutocomplete = false;
        return;
      }

      SearchService.UsersAndLists($scope.searchTerm, searchLimit).then(function(data) {
        $scope.searchLists = data[0];
        $scope.searchPeople = data[1];
        $scope.showAutocomplete = data[0].length || data[1].length ? true : false;
      });
    };

    $scope.fullSearch = function (searchTerm, view) {
      var params = {q: searchTerm};
      if (view) {
        params.view = view;
      }
      $location.path('/search').search(params);
    };

    $scope.searchUsersAutocomplete = function () {
      if ($scope.searchUsersTerm.length < minSearchLength) {
        $scope.showUsersAutocomplete = false;
        return;
      }

      User.query({name: $scope.searchUsersTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
        $scope.landingUsers = data;
        $scope.showUsersAutocomplete = true;
      });
    };

    $scope.searchListsAutocomplete = function () {
      if ($scope.searchListsTerm.length < minSearchLength) {
        $scope.showListsAutocomplete = false;
        return;
      }

      List.query({name: $scope.searchListsTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
        $scope.landingLists = data;
        $scope.showListsAutocomplete = true;
      });
    };

    $scope.saveSearch = function (result, type) {
      SearchService.saveSearch($scope.currentUser, result, type, function (user) {
        $scope.setCurrentUser(user);
      });
    }

    $rootScope.$on('$routeChangeSuccess', function () {
      $scope.showAutocomplete = false;
      $scope.searchTerm = '';
    });

  }

})();
