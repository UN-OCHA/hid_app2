(function () {
  'use strict';

  angular
    .module('app.notifications')
    .controller('NotificationsController', NotificationsController);

  NotificationsController.$inject = ['$scope', 'notificationsService'];

  function NotificationsController($scope, notificationsService) {
    var thisScope = $scope;

    var limit = 10;
    thisScope.itemsPerPage = limit;
    thisScope.totalItems = 0;
    thisScope.notifications = {};
    thisScope.currentPage = 1;
    thisScope.notificationsLoaded = false;

    var params = {
      limit: limit,
      offset: 0,
      sort: '-createdAt'
    };

    thisScope.getNotifications = function () {
      params.offset = (thisScope.currentPage - 1) * thisScope.itemsPerPage;

      notificationsService.getNotifications(params).then(function () {
        thisScope.notifications = notificationsService;
        thisScope.totalItems = notificationsService.total;
        thisScope.notificationsLoaded = true;

        if (notificationsService.totalUnread > 0 ) {
          notificationsService.markAsRead();
        }
      });

    };

    thisScope.getNotifications();

  }
})();
