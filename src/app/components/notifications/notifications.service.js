(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('notificationsService', notificationsService);

  notificationsService.$inject = ['$log', '$q', '$resource', '$rootScope', 'config'];

  function notificationsService($log, $q, $resource, $rootScope, config) {

   var resource =  $resource(config.apiUrl + 'notification/:notificationId', {notificationId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    function updateUser (notifications) {
      var update = notifications.find(function (notification) {
        var notificationTypes = ['approved_checkin', 'admin_edit'];
        return notificationTypes.indexOf(notification.type) !== -1;
      });

      if (update) {
        $rootScope.$broadcast('updateCurrentUser');
      }
    }

    var notifications = {
      all: {},
      unread: {},
      total: 0,
      totalUnread: 0,

      getUnread: function () {
        return resource.query({read: false}).$promise.then(function (response) {
          notifications.unread = angular.copy(response);
          notifications.totalUnread = response.length;
          updateUser(notifications.unread);
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

      markAsRead: function () {
        return resource.update().$promise.then(function () {
          notifications.totalUnread = 0;
          notifications.unread = {};
          return ;
        }, function (error) {
          $log.error(error);
          return;
        });
      }

    };

    return notifications;

  }

})();
