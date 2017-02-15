(function () {
  'use strict';

  angular
    .module('app.search')
    .factory('SearchService', SearchService);

  SearchService.$inject = ['$exceptionHandler', 'List', 'User', '$q'];

  function SearchService($exceptionHandler, List, User, $q) {

    var Search = {};

    Search.UsersAndLists = function (searchTerm, limit) {
      return $q.all([
        List.query({name: searchTerm, limit: limit, sort: 'name'}).$promise,
        User.query({name: searchTerm, limit: limit, sort: 'name'}).$promise
      ]).then(function(data) {
        return data;
      }, function (error) {
        $exceptionHandler(error, 'Search - get users and lists fail');
      });
    };

    Search.saveSearch = function (user, searchResult, type, success) {
      var searches = [];
      var savedSearchesLimit = 5;
      var key = type === 'user' ? 'recentUserSearches' : 'recentListSearches';
      var param = {};
      var saveResult = {
        id: searchResult._id,
        name: searchResult.name,
        link: type === 'user' ? 'users/' + searchResult._id : 'lists/' + searchResult._id
      };

      if (user.appMetadata && user.appMetadata.hid && user.appMetadata.hid[key]) {
        searches = user.appMetadata.hid[key];
      } 

      var searchSaved = searches.filter(function (search) {
        return search.id === saveResult.id;
      })[0];

      if (searchSaved) {
        return;
      }

      if (searches.length >= savedSearchesLimit) {
        searches.pop();
      }
      searches.unshift(saveResult);
      param[key] = searches;      
      user.setAppMetaData(param);
      user.$update(function () {
        success(user);
      }, function (error) {
        $exceptionHandler(error, 'Update user recent searches fail');
      });
    };

    return Search;

  }

})();
