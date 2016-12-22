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

    var params = {
      limit: limit,
      offset: 0,
      sort: '-createdAt'
    };

    function markAsRead (notifications) {
      angular.forEach(notifications, function (notification) {
        if (!notification.read) {
          notification.read = true;
          notificationsService.markAsRead(notification);
        }
      });
      notificationsService.totalUnread = 0;
      notificationsService.unread = {};
    }

    $scope.getLink = function (notification) {
      if (notification.params && notification.params.list) {
        return '/lists/' + notification.params.list._id;
      }
      return '/users/' + notification.user;
    };

    $scope.getNotifications = function () {
      params.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
      notificationsService.getNotifications(params).then(function () {
        $scope.notifications = notificationsService;
        $scope.totalItems = 50; // TO DO - change this to use real value when can access it from the api
        markAsRead(notificationsService.all);
      });
    };

    $scope.getNotifications();

  }
})();
