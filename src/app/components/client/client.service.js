(function () {
  'use strict';

  angular
    .module('app.client')
    .factory('Client', Client);

  Client.$inject = ['$resource', '$http', '$location', 'config'];

  function Client ($resource, $http, $location, config) {
    var Client = $resource(config.apiUrl + 'client/:clientId', {clientId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    return Client;
  }
})();