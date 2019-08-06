(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserCheckInService', UserCheckInService);

  UserCheckInService.$inject = ['$resource', 'config'];

  function UserCheckInService($resource, config) {

    return $resource(config.apiUrl + 'user/:userId/:listType/:checkInId', {},
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
      }
     );

  }

})();
