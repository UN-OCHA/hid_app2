(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserCheckInService', UserCheckInService);

  UserCheckInService.$inject = ['$cachedResource', 'config'];

  function UserCheckInService($cachedResource, config) {

    return $cachedResource('userCheckins', config.apiUrl + 'user/:userId/:listType/:checkInId', {},
      {
       'save': {
         method: 'POST',
         cache: false
       },
       'remove': {
         method: 'DELETE',
         cache: false
       },
       'delete': {
         method: 'DELETE',
         cache: false
       },
       'update': {
         method: 'PUT',
           // TODO: find a way to cache these requests, and fix https://github.com/goodeggs/angular-cached-resource/issues/72
           cache: false
         }
       }
     );

  }

})();
