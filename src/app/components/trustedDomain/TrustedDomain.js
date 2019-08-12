(function () {
  'use strict';

  angular
    .module('app.trustedDomain')
    .factory('TrustedDomain', TrustedDomain);

  TrustedDomain.$inject = ['$resource', 'config'];

  function TrustedDomain ($resource, config) {
    var TrustedDomain = $resource(config.apiUrl + 'trustedDomain/:id', {id: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    return TrustedDomain;
  }
})();
