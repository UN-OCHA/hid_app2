(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('hidNotification', hidNotification);

  hidNotification.$inject = ['$resource', 'config'];

  function hidNotification($resource, config) {

   return $resource(config.apiUrl + 'notification/:notificationId', {notificationId: '@_id'});

  }

})();
