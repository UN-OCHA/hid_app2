(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('notificationsService', notificationsService);

  notificationsService.$inject = ['$exceptionHandler', '$q', '$resource', '$rootScope', 'config'];

  function notificationsService($exceptionHandler, $q, $resource, $rootScope, config) {

   var resource =  $resource(config.apiUrl + 'notification/:notificationId', {notificationId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    function updateUser (notifications) {
      var update = notifications.filter(function (notification) {
        var notificationTypes = ['approved_checkin', 'admin_edit'];
        return notificationTypes.indexOf(notification.type) !== -1;
      })[0];

      if (update) {
        $rootScope.$broadcast('updateCurrentUser');
      }
    }

    function buildLink (notification) {
      if (notification.params && notification.params.list) {
        var listId = typeof notification.params.list === 'string' ? notification.params.list : notification.params.list._id;
        return '/lists/' + listId;
      }
      if (notification.type === 'connection_request') {
        return '/settings';
      }
      if (notification.type === 'connection_approved') {
        return '/users/' + notification.createdBy;
      }
      return '/users/' + notification.user;
    }

    function addLinks (notifications) {
      angular.forEach(notifications, function (notification) {
        notification.link = buildLink(notification);
      });
      return notifications;
    }

    var notifications = {
      all: {},
      unread: {},
      total: 0,
      totalUnread: 0,

      getUnread: function () {
        return resource.query({read: false}).$promise.then(function (response) {
          notifications.unread = addLinks(angular.copy(response));
          notifications.totalUnread = response.length;
          updateUser(notifications.unread);
          return notifications.unread;
        }, function (error) {
          $exceptionHandler(error, 'notificationsService getUnread');
          return;
        });
      },

      getNotifications: function (params) {
        var defer = $q.defer();
        resource.query(params, function (response, headers) {
          notifications.all = addLinks(angular.copy(response));
          notifications.total = headers()['x-total-count'];
          defer.resolve();
        }, function (error) {
          $exceptionHandler(error, 'notificationsService getNotifications');
          defer.reject();
        });
        return defer.promise;
      },

      markAsRead: function () {
        return resource.update({read: true, notified: true}).$promise.then(function () {
          notifications.totalUnread = 0;
          notifications.unread = {};
          return ;
        }, function (error) {
          $exceptionHandler(error, 'notificationsService markAsRead');
          return;
        });
      },

      update: function (notification) {
        notification.$update();
        if (notification.read && notifications.totalUnread > 0) {
          notifications.totalUnread -= 1;
          notifications.unread.splice(notifications.unread.indexOf(notification), 1);
        }
      }

    };

    return notifications;

  }

})();
