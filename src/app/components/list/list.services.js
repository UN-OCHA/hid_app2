var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$cachedResource', 'config', 'User',
  function ($cachedResource, config, User) {
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
]);

listServices.factory('listService', ['$rootScope', 'List',
  function ($rootScope, List) {
    var filters = {}, lists = {}, request = {};

    return {
      addFilter: function(key, val, notify) {
        filters[key] = val;
        if (notify) this.notify();
      },

      setFilters: function(filters2, notify) {
        filters = filters2;
        if (notify) this.notify();
      },

      setRequest: function (req, notify) {
        request = req;
        if (notify) this.notify();
      },

      removeFilter: function(key, notify) {
        delete filters[key];
        if (notify) this.notify();
      },

      filter: function(cb) {
        var trequest = angular.copy(request);
        lists.length = 0;
        angular.merge(trequest, filters);
        lists = List.query(trequest, cb);
      },

      getLists: function() {
        return lists;
      },

      subscribe: function(scope, callback) {
        var handler = $rootScope.$on('lists-updated-event', callback);
        scope.$on('$destroy', handler);
      },

      notify: function () {
        $rootScope.$emit('lists-updated-event');
      }
    };
  }
]);
