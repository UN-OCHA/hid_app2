(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('List', List);

  List.$inject = ['$cachedResource', 'config', 'User'];

  function List ($cachedResource, config, User) {
    var List = $cachedResource('list', config.apiUrl + 'list/:listId', {listId: '@_id'},
    {
      'save': {
        method: 'POST',
        cache: false
      },
      'remove': {
        method: 'DELETE',
        cache: false
      },
      'delete': {
        method: 'DELETE',
        cache: false
      },
      'update': {
        method: 'PUT',
        cache: false
      }
    });

    // Is a user manager of a list ?
    List.prototype.isManager = function (user) {
      var out = false;
      angular.forEach(this.managers, function (val, key) {
        if (angular.equals(user._id, val._id)) {
          out = true;
        }
      });
      return out;
    };

    // Cache a list for future offline use
    List.prototype.cache = function () {
      var request = { limit: 50, offset: 0, sort: 'name'};
      var recursiveFunction = function (users) {
        if (users.length > 49) {
          // There is another page of data
          request.offset = request.offset + 50;
          User.query(request).$httpPromise.then(recursiveFunction);
        }
      }
      request[this.type + 's.list'] = this._id;
      User.query(request).$httpPromise.then(recursiveFunction);
    };

    return List;
  }
})();