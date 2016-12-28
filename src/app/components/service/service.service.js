(function () {
  'use strict';

  angular
    .module('app.service')
    .factory('Service', Service);

  Service.$inject = ['$resource', '$http', '$location', 'config'];

  function Service ($resource, $http, $location, config) {
    var Service = $resource(config.apiUrl + 'service/:serviceId', {serviceId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    return Service;
  }
})();
