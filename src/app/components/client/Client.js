(function () {
  'use strict';

  angular
    .module('app.client')
    .factory('Client', Client);

  Client.$inject = ['$resource', 'config'];

  function Client ($resource, config) {
    var interceptor = function (response) {
      // Get the instance from the response object
      var instance = response.resource;

      // Change the redirectUrls
      instance.redirectUrls = instance.redirectUrls.join("\n");
      return instance;
    };

    var Client = $resource(config.apiUrl + 'client/:clientId', {clientId: '@_id'},
    {
      'get': {
        method: 'GET',
        interceptor: {
          response: interceptor
        }
      },
      'update': {
        method: 'PUT',
        interceptor: {
          response: interceptor
        }
      },
      'save': {
        method: 'POST',
        interceptor: {
          response: interceptor
        }
      }
    });

    return Client;
  }
})();
