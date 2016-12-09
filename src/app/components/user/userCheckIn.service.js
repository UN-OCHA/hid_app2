(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserCheckInService', UserCheckInService);

  UserCheckInService.$inject = ['$cachedResource', 'config'];

  function UserCheckInService($cachedResource, config) {

    return $cachedResource('userCheckins', config.apiUrl + 'user/:userId/:listType/:checkInId');

  }

})();
