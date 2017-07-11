(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchFormCtrl', SearchFormCtrl);

  SearchFormCtrl.$inject = ['$rootScope', '$route', '$scope', '$location', 'SearchService', 'User', 'List'];

  function SearchFormCtrl($rootScope, $route, $scope, $location, SearchService, User, List) {

    $scope.searchTerm = '';
    $scope.searchUsersTerm = '';
    $scope.searchListsTerm = '';
    $scope.searchLists = [];
    $scope.searchPeople = [];
    $scope.landingOperations = [];
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
      var searchTerm = $scope.searchTerm.trim();
      SearchService.UsersAndLists(searchTerm, searchLimit, $scope.currentUser).then(function(data) {
        $scope.searchLists = data[0];
        $scope.searchPeople = data[1];
        $scope.showAutocomplete = data[0].length || data[1].length ? true : false;
      });
    };

    $scope.fullSearch = function (searchTerm, view, filterType) {
      var params = {q: searchTerm};
      if (view) {
        params.view = view;
      }
      if (filterType) {
        params.type = filterType;
      }
      $location.path('/search').search(params);
      $route.reload();
    };

    function goToOperation (operation) {
      var url = '/lists/' + operation._id;
      $scope.saveSearch(operation, 'operation');
      $location.path(url);
    }

    $scope.fullOperationsSearch = function (searchTerm) {

      if (!$scope.landingOperations.length) {
        List.query({name: $scope.searchOperationsTerm, limit: 5, sort: 'name', type: 'operation'}).$promise.then(function (data) {
          $scope.landingOperations = data;
          if ($scope.landingOperations.length === 1) {
            goToOperation($scope.landingOperations[0]);
            return;
          }
        });
      }

      if ($scope.landingOperations.length === 1) {
        goToOperation($scope.landingOperations[0]);
        return;
      }

      var params = {
        q: searchTerm,
        type: 'operation',
        view: 'lists'
      };
      $location.path('/search').search(params);
    };

    $scope.searchUsersAutocomplete = function () {
      if ($scope.searchUsersTerm.length < minSearchLength) {
        $scope.showUsersAutocomplete = false;
        return;
      }
      var searchTerm = $scope.searchUsersTerm.trim();
      var params = {name: searchTerm, limit: 5, sort: 'name'};
      if (!$scope.currentUser.is_admin && !$scope.currentUser.isManager) {
        params.authOnly = false;
      }


      User.query(params).$promise.then(function (data) {
        $scope.landingUsers = data;
        $scope.showUsersAutocomplete = true;
      });
    };

    $scope.searchOperationsAutocomplete = function () {
      if ($scope.searchOperationsTerm.length < minSearchLength) {
        $scope.showOperationsAutocomplete = false;
        return;
      }
      var searchTerm = $scope.searchOperationsTerm.trim();
      List.query({name: searchTerm, limit: 5, sort: 'name', type: 'operation'}).$promise.then(function (data) {
        $scope.landingOperations = data;
        $scope.showOperationsAutocomplete = true;
      });
    };

    $scope.searchListsAutocomplete = function () {
      if ($scope.searchListsTerm.length < minSearchLength) {
        $scope.showListsAutocomplete = false;
        return;
      }
      var searchTerm = $scope.searchListsTerm.trim();
      List.query({name: searchTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
        $scope.landingLists = data;
        $scope.showListsAutocomplete = true;
      });
    };

    $scope.saveSearch = function (result, type) {
      SearchService.saveSearch($scope.currentUser, result, type, function (user) {
        $scope.setCurrentUser(user);
      });
    };

    $rootScope.$on('$routeChangeSuccess', function () {
      $scope.showAutocomplete = false;
      $scope.searchTerm = '';
    });

  }

})();
