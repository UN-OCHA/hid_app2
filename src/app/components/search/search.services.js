appServices.factory('Search', ['List', 'User', '$q',
  function(List, User, $q){

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

}]);
