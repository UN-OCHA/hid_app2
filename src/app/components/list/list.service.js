(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('List', List);

  List.$inject = ['$resource', '$rootScope', '$localForage', '$exceptionHandler', '$q', '$timeout', 'gettextCatalog', 'config', 'User'];

  function List ($resource, $rootScope, $localForage, $exceptionHandler, $q, $timeout, gettextCatalog, config, User) {
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

    // Is user owner of the list ?
    List.prototype.isOwner = function (user) {
      return angular.equals(user._id, this.owner._id);
    };

    // Determine whether a user has access to a list and can cache it
    List.prototype.isCacheable = function (user) {
      if (this.visibility === 'all' || this.visibility === 'inlist'
        || (this.visibility === 'verified' && user.verified)
        || (this.visibility === 'me' && (this.owner === user._id.toString() || this.managers.indexOf(user._id.toString()) !== -1))) {
        return true;
      }
      else {
        return false;
      }
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
      request.authOnly = false;
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
          // Short delay between requests for pages of users
          $timeout(function () {
          // setTimeout(function () {
            cacheListUsers(request, lfusers, deferred);
          }, 2000);
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

    List.roles = [
        {
            "_id": "58e39c4eab77c100ae461b99",
            "name": gettextCatalog.getString("Administrative Officer")
        },
        {
            "_id": "58e39c4fab77c100ae461bd2",
            "name": gettextCatalog.getString("Area Coordinator")
        },
        {
            "_id": "58e39c4eab77c100ae461b9f",
            "name": gettextCatalog.getString("Civil-Military Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461ba2",
            "name": gettextCatalog.getString("Cluster Co-Chair / Co-Lead")
        },
        {
            "_id": "58e39c4fab77c100ae461bd8",
            "name": gettextCatalog.getString("Cluster Coordination Team - Focal Points")
        },
        {
            "_id": "58e39c4eab77c100ae461ba5",
            "name": gettextCatalog.getString("Cluster Coordinator")
        },
        {
            "_id": "58e39c4eab77c100ae461ba8",
            "name": gettextCatalog.getString("Communications / PI Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461bba",
            "name": gettextCatalog.getString("Donor")
        },
        {
            "_id": "5988f63f0cb8ee0114dd93bf",
            "name": gettextCatalog.getString("Environmental Expert")
        },
        {
            "_id": "58e39c4eab77c100ae461bab",
            "name": gettextCatalog.getString("GenCap Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461bae",
            "name": gettextCatalog.getString("Government Official")
        },
        {
            "_id": "58e39c4eab77c100ae461b9c",
            "name": gettextCatalog.getString("Head of Agency")
        },
        {
            "_id": "58e39c4fab77c100ae461bcc",
            "name": gettextCatalog.getString("Head of Agency - Executive Assistant / Secretary")
        },
        {
            "_id": "58e39c4fab77c100ae461bc9",
            "name": gettextCatalog.getString("Head of Sub-Office")
        },
        {
            "_id": "58e39c4eab77c100ae461bbd",
            "name": gettextCatalog.getString("Humanitarian Coordinator")
        },
        {
            "_id": "58e39c4eab77c100ae461bb1",
            "name": gettextCatalog.getString("Humanitarian Country Team")
        },
        {
            "_id": "58e39c4eab77c100ae461bb4",
            "name": gettextCatalog.getString("Information Management Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461bc0",
            "name": gettextCatalog.getString("Military Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461bb7",
            "name": gettextCatalog.getString("ProCap Officer")
        },
        {
            "_id": "58e39c4eab77c100ae461bc6",
            "name": gettextCatalog.getString("Resident Coordinator")
        },
        {
            "_id": "58e39c4eab77c100ae461bc3",
            "name": gettextCatalog.getString("UNCT Member")
        },
        {
            "_id": "58e39c4fab77c100ae461bd5",
            "name": gettextCatalog.getString("UNDAC Member")
        }
    ];

    return List;
  }
})();
