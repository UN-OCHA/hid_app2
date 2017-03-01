(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('List', List);

  List.$inject = ['$resource', '$rootScope', '$localForage', '$exceptionHandler', '$q', 'config', 'User'];

  function List ($resource, $rootScope, $localForage, $exceptionHandler, $q, config, User) {
    var List = $resource(config.apiUrl + 'list/:listId', {listId: '@_id'},
    {
      'save': {
        method: 'POST'
      },
      'remove': {
        method: 'DELETE'
      },
      'delete': {
        method: 'DELETE'
      },
      'update': {
        method: 'PUT'
      }
    });

    var numUsersToCache = 100;

    // Is a user manager of a list ?
    List.prototype.isManager = function (user) {
      var out = false;
      angular.forEach(this.managers, function (val) {
        if (angular.equals(user._id, val._id)) {
          out = true;
        }
      });
      return out;
    };

    function cacheUsers (lfusers, users, count, total, callback) {
      // if run out of users
      if (!users[count]) {
        return callback(true);
      }
       return lfusers.setItem(users[count]._id, users[count]).then(function () {
        // if last user
        if (count === total-1) {
          return callback(true);
        }

        cacheUsers(lfusers, users, count+1, total, callback);
      })
      .catch(function (error) {
        $exceptionHandler(error, 'Failed to write user to local db');
        if (error.code === 4) {
          //rejected as not enough space or user has declined;
          $rootScope.canCache = false; // prevent retrying in x minutes
        }
        return callback(false); 
      });
    }

    function cacheListUsers (request, lfusers, deferred) {
      User.query(request).$promise.then(function (users) {
        cacheUsers(lfusers, users, 0, numUsersToCache, function (canCache) {
          //return if caching failed
          if (!canCache) {
            deferred.reject();
            return;
          }
          //return if final / only page
          if (users.length < numUsersToCache) {
            deferred.resolve();
            return;
          }
          request.offset = request.offset + numUsersToCache;
          cacheListUsers(request, lfusers, deferred);
        });

      }, function (error) {
        $exceptionHandler(error, 'cacheListUsers - user.query');
      });
    }

    List.prototype.cache = function () {
      var deferred = $q.defer();
      var lfusers = $localForage.instance('users');
      var lflists = $localForage.instance('lists');
      var request = {limit: numUsersToCache, offset: 0, sort: 'name'};
      request[this.type + 's.list'] = this._id;

      if (!$rootScope.canCache) {
        return;
      }

      //cache the list
      lflists.setItem(this._id, this).then(function () {
        cacheListUsers(request, lfusers, deferred);
      }).catch(function(error) {
        $exceptionHandler(error, 'Failed to write list to local db');
        deferred.reject();
      });

      return deferred.promise;
    };

    List.prototype.associatedOperations = function () {
      var operationIds = [];

      // If an operation, get its id
      if (this.type === 'operation') {
        operationIds.push(this.remote_id);
        return operationIds;
      }

      // If no associated operations return
      if (!this.metadata || !this.metadata.operation) {
        return;
      }

      // Get all the associated operations
      angular.forEach(this.metadata.operation, function(operation) {
        operationIds.push(operation.id);
      });

      return operationIds;
    };

    return List;
  }
})();
