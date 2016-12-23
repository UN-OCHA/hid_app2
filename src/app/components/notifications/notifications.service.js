(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('notificationsService', notificationsService);

  notificationsService.$inject = ['$log', '$q', '$resource', 'config'];

  function notificationsService($log, $q, $resource, config) {

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
        var defer = $q.defer();
        resource.query(params, function (response, headers) {
          notifications.all = angular.copy(response);
          notifications.total = headers()['x-total-count'];
          defer.resolve();
        }, function (error) {
          $log.error(error);
          defer.reject();
        });
        return defer.promise;
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
