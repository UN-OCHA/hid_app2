(function () {
  'use strict';

  angular
    .module('app.operations')
    .factory('Operation', Operation);

  Operation.$inject = ['$resource', 'config'];

  function Operation ($resource, config) {
    var Operation = $resource(config.apiUrl + 'operation/:operationId', {operationId: '@_id'},
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
    Operation.prototype.isManager = function (user) {
      var out = false;
      angular.forEach(this.managers, function (val) {
        if (angular.equals(user._id, val._id)) {
          out = true;
        }
      });
      return out;
    };

    return Operation;
  }
})();
