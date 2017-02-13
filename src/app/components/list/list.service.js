(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('List', List);

  List.$inject = ['$resource', '$localForage', '$exceptionHandler', '$q', 'config', 'User'];

  function List ($resource, $localForage, $exceptionHandler, $q, config, User) {
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

    function cacheUsers (users, lfusers, deferred) {
      angular.forEach(users, function (user) {
        lfusers.setItem(user._id, user).then(function () {})
        .catch(function (err) {
          $exceptionHandler(err, 'Failed to write to Indexeddb');
          deferred.reject();
        });
      });
    }

    function cacheListUsers (request, lfusers, deferred) {
      User.query(request).$promise.then(function (users) {
        cacheUsers(users, lfusers, deferred);
        //return if final / only page
        if (users.length < 50) {
          deferred.resolve();
          return;
        }
        request.offset = request.offset + 50;
        cacheListUsers(request, lfusers, deferred);
      });
    }

    List.prototype.cache = function () {
      var deferred = $q.defer();
      var lfusers = $localForage.instance('users');
      var lflists = $localForage.instance('lists');
      var request = {limit: 50, offset: 0, sort: 'name'};

      //cache the list
      lflists.setItem(this._id, this).then(function () {}).catch(function(error) {
        $exceptionHandler(error, 'Failed to write to Indexeddb');
        deferred.reject();
      });

      request[this.type + 's.list'] = this._id;
      cacheListUsers(request, lfusers, deferred);
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
