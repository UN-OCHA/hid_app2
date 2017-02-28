(function () {
  'use strict';

  angular
    .module('app.search')
    .factory('SearchService', SearchService);

  SearchService.$inject = ['$exceptionHandler', 'List', 'User', '$q'];

  function SearchService($exceptionHandler, List, User, $q) {

    function alreadySaved (searches, resultId) {
      return searches.filter(function (search) {
        return search.id === resultId;
      })[0];
    }

    function populateSearches (user, params) {
      console.log(populateSearches, user, params)
      var searchTypes = ['user', 'list', 'operation'];
      angular.forEach(searchTypes, function (searchType) {
        params.recentSearches[searchType] = [];

        if (user.appMetadata.hid.recentSearches[searchType]) {
          params.recentSearches[searchType] = user.appMetadata.hid.recentSearches[searchType]; 
        }
      });
      return params;
    }

    var Search = {};

    Search.UsersAndLists = function (searchTerm, limit) {
      return $q.all([
        List.query({name: searchTerm, limit: limit, sort: 'name'}).$promise,
        User.query({name: searchTerm, limit: limit, sort: 'name', 'appMetadata.hid.login': true}).$promise
      ]).then(function(data) {
        return data;
      }, function (error) {
        $exceptionHandler(error, 'Search - get users and lists fail');
      });
    };

    Search.saveSearch = function (user, searchResult, type, success) {
      var savedSearchesLimit = 5;
      var params = {
        recentSearches: {}
      };
      params.recentSearches[type] = [];

      var saveResult = {
        id: searchResult._id,
        name: searchResult.name,
        link: type === 'user' ? 'users/' + searchResult._id : 'lists/' + searchResult._id
      };

      if (user.appMetadata && user.appMetadata.hid && user.appMetadata.hid.recentSearches) {
        params = populateSearches(user, params);

        if (alreadySaved(params.recentSearches[type], saveResult.id)) {
          return;
        }
      }
      
      if (params.recentSearches[type].length >= savedSearchesLimit) {
         params.recentSearches[type].pop();
      }
      params.recentSearches[type].unshift(saveResult);

      user.setAppMetaData(params);
      user.$update(function () {
        success(user);
      }, function (error) {
        $exceptionHandler(error, 'Update user recent searches fail');
      });
    };

    return Search;

  }

})();
