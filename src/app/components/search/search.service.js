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

    Search.UsersAndLists = function (searchTerm, limit, currentUser) {
      var userParams = {name: searchTerm, limit: limit, sort: 'name'};
      if (currentUser && !currentUser.is_admin && !currentUser.isManager) {
        userParams['appMetadata.hid.login'] = true;
      }

      return $q.all([
        List.query({name: searchTerm, limit: limit, sort: 'name'}).$promise,
        User.query(userParams).$promise
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

      User.get({userId: user._id}, function (response) {
        user = response;
        user.setAppMetaData(params);
        user.$update(function () {
          success(user);
        }, function (error) {
          $exceptionHandler(error, 'Save search - update user');
        });
      },function (error) {
        $exceptionHandler(error, 'Save search - get user');
      });
    };

    return Search;

  }

})();
