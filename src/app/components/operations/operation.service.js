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

    return Operation;
  }
})();
