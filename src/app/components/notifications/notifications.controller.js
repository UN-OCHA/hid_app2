(function () {
  'use strict';

  angular
    .module('app.notifications')
    .controller('NotificationsCtrl', NotificationsCtrl);

  NotificationsCtrl.$inject = ['$scope', 'notificationsService'];

  function NotificationsCtrl($scope, notificationsService) {
    var limit = 10;
    $scope.itemsPerPage = limit;
    $scope.totalItems = 0;
    $scope.notifications = {};
    $scope.currentPage = 1;
    $scope.notificationsLoaded = false;

    var params = {
      limit: limit,
      offset: 0,
      sort: '-createdAt'
    };

    $scope.getLink = function (notification) {
      if (notification.params && notification.params.list) {
        var listId = typeof notification.params.list === 'string' ? notification.params.list : notification.params.list._id
        return '/lists/' + listId;
      }
      if (notification.type === 'connection_request') {
        return '/settings'
      }
      if (notification.type === 'connection_approved') {
        return '/users/' + notification.createdBy;
      }
      return '/users/' + notification.user;
    };

    $scope.getNotifications = function () {
      params.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;

      notificationsService.getNotifications(params).then(function () {
        $scope.notifications = notificationsService;
        $scope.totalItems = notificationsService.total;
        $scope.notificationsLoaded = true;

        if (notificationsService.totalUnread > 0 ) {
          notificationsService.markAsRead();
        }
      });

    };

    $scope.getNotifications();

  }
})();
