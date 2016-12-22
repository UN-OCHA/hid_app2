(function () {
  'use strict';

  angular
    .module('app.notifications')
    .controller('NotificationsCtrl', NotificationsCtrl);

  NotificationsCtrl.$inject = ['$scope', 'notificationsService'];

  function NotificationsCtrl($scope, notificationsService) {
    $scope.notifications = {};

    notificationsService.getNotifications({}).then(function (data) {
      $scope.notifications = notificationsService;
      notificationsService.markAllAsRead();
    });

    $scope.getLink = function (notification) {
      if (notification.params && notification.params.list) {
        return '/lists/' + notification.params.list._id;
      }
      return '/users/' + notification.user;
    }
  }
})();
