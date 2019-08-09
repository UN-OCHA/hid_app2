(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchFormController', SearchFormController);

  SearchFormController.$inject = ['$rootScope', '$route', '$scope', '$location', 'SearchService', 'User', 'List'];

  function SearchFormController($rootScope, $route, $scope, $location, SearchService, User, List) {
    var thisScope = $scope;

    thisScope.searchTerm = '';
    thisScope.searchUsersTerm = '';
    thisScope.searchListsTerm = '';
    thisScope.searchLists = [];
    thisScope.searchPeople = [];
    thisScope.landingOperations = [];
    thisScope.showAutocomplete = false;
    thisScope.showUsersAutocomplete = false;
    thisScope.showListsAutocomplete = false;
    var minSearchLength = 3;
    var searchLimit = 3;

    thisScope.searchAutocomplete = function() {
      if (thisScope.searchTerm.length < minSearchLength) {
        thisScope.showAutocomplete = false;
        return;
      }
      var searchTerm = thisScope.searchTerm.trim();
      SearchService.UsersAndLists(searchTerm, searchLimit, thisScope.currentUser).then(function(data) {
        thisScope.searchLists = data[0];
        thisScope.searchPeople = data[1];
        thisScope.showAutocomplete = true;
      });
    };

    thisScope.fullSearch = function (searchTerm, view, filterType) {
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
      thisScope.saveSearch(operation, 'operation');
      $location.path(url);
    }

    function goToOperationSearch (searchTerm) {
      var params = {
        q: searchTerm,
        type: 'operation',
        view: 'lists'
      };
      $location.path('/search').search(params);
    }

    thisScope.fullOperationsSearch = function (searchTerm) {

      if (!thisScope.landingOperations.length) {
        List.query({name: thisScope.searchOperationsTerm, limit: 5, sort: 'name', type: 'operation'}).$promise.then(function (data) {
          thisScope.landingOperations = data;
          if (thisScope.landingOperations.length === 1) {
            goToOperation(thisScope.landingOperations[0]);
          }
          else {
            goToOperationSearch(searchTerm);
          }
        });
      }
      else {
        if (thisScope.landingOperations.length === 1) {
          goToOperation(thisScope.landingOperations[0]);
        }
        else {
          goToOperationSearch(searchTerm);
        }
      }
    };

    thisScope.searchUsersAutocomplete = function () {
      if (thisScope.searchUsersTerm.length < minSearchLength) {
        thisScope.showUsersAutocomplete = false;
        return;
      }
      var searchTerm = thisScope.searchUsersTerm.trim();
      var params = {q: searchTerm, limit: 5, sort: 'name'};
      if (!thisScope.currentUser.is_admin && !thisScope.currentUser.isManager) {
        params.authOnly = false;
      }


      User.query(params).$promise.then(function (data) {
        thisScope.landingUsers = data;
        thisScope.showUsersAutocomplete = true;
      });
    };

    thisScope.searchOperationsAutocomplete = function () {
      if (thisScope.searchOperationsTerm.length < minSearchLength) {
        thisScope.showOperationsAutocomplete = false;
        return;
      }
      var searchTerm = thisScope.searchOperationsTerm.trim();
      List.query({name: searchTerm, limit: 5, sort: 'name', type: 'operation'}).$promise.then(function (data) {
        thisScope.landingOperations = data;
        thisScope.showOperationsAutocomplete = true;
      });
    };

    thisScope.searchListsAutocomplete = function () {
      if (thisScope.searchListsTerm.length < minSearchLength) {
        thisScope.showListsAutocomplete = false;
        return;
      }
      var searchTerm = thisScope.searchListsTerm.trim();
      List.query({name: searchTerm, limit: 5, sort: 'name'}).$promise.then(function (data) {
        thisScope.landingLists = data;
        thisScope.showListsAutocomplete = true;
      });
    };

    thisScope.saveSearch = function (result, type) {
      SearchService.saveSearch(thisScope.currentUser, result, type, function (user) {
        thisScope.setCurrentUser(user);
      });
    };

    $rootScope.$on('$routeChangeSuccess', function () {
      thisScope.showAutocomplete = false;
      thisScope.searchTerm = '';
    });

  }

})();
