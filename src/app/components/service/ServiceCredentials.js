(function () {
  'use strict';

  angular
    .module('app.service')
    .factory('ServiceCredentials', ServiceCredentials);

  ServiceCredentials.$inject = ['$resource', '$http', 'config'];

  function ServiceCredentials ($resource, $http, config) {
    var ServiceCredentials = $resource(config.apiUrl + 'servicecredentials/:credsId', {credsId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    return ServiceCredentials;
  }
})();
