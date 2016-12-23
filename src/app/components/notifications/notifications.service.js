(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('notificationsService', notificationsService);

  notificationsService.$inject = ['$log', '$resource', 'config'];

  function notificationsService($log, $resource, config) {

   var resource =  $resource(config.apiUrl + 'notification/:notificationId', {notificationId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    var notifications = {
      all: {},
      unread: {},
      total: 0,
      totalUnread: 0,

      getUnread: function () {
        return resource.query({read: false}).$promise.then(function (response) {
          notifications.unread = angular.copy(response);
          notifications.totalUnread = response.length;
          return response;
        }, function (error) {
          $log.error(error);
          return;
        });
      },

      getNotifications: function (params) {
        return resource.query(params).$promise.then(function (response) {
          notifications.all = angular.copy(response);
          return response;
        }, function (error) {
          $log.error(error);
          return;
        });
      },

      markAsRead: function (notification) {
        return resource.update(notification).$promise.then(function () {
          return;
        }, function (error) {
          $log.error(error);
          return;
        });
      }

    };

    return notifications;

  }

})();
