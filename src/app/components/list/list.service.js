(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('List', List);

  List.$inject = ['$resource', '$localForage', '$exceptionHandler', 'config', 'User'];

  function List ($resource, $localForage, $exceptionHandler, config, User) {
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

    // Cache a list for future offline use
    List.prototype.cache = function () {
      var lfusers = $localForage.instance('users');
      var lflists = $localForage.instance('lists');
      var request = { limit: 50, offset: 0, sort: 'name'};
      lflists.setItem(this._id, this, function (err) {
        if (err) {
          $exceptionHandler(err, 'Failed to write to Indexeddb');
        }
      });
      var recursiveFunction = function (users) {
        if (users.length > 49) {
          // There is another page of data
          User.query(request).$promise.then(function (users) {
            for (var i = 0; i < users.length; i++) {
              lfusers.setItem(users[i].id, users[i], function (err) {
                if (err) {
                  $exceptionHandler(err, 'Failed to write to Indexeddb');
                }
              });
            }
            request.offset = request.offset + 50;
            recursiveFunction(users);
          });
        }
      };
      request[this.type + 's.list'] = this._id;
      User.query(request).$promise.then(recursiveFunction);
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
    }

    return List;
  }
})();
