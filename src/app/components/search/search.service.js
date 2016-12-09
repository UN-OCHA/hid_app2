(function () {
  'use strict';

  angular
    .module('app.search')
    .factory('SearchService', SearchService);

  SearchService.$inject = ['List', 'User', '$q'];

  function SearchService(List, User, $q) {

    var Search = {};

    Search.UsersAndLists = function(searchTerm, limit) {
      return $q.all([
        List.query({name: searchTerm, limit: limit, sort: 'name'}).$promise,
        User.query({name: searchTerm, limit: limit, sort: 'name'}).$promise
      ]).then(function(data) {
        return data;
      }, function (error) {
        $log.error(error);
      });
    }

    return Search;

  }

})();
