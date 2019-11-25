(function() {
  'use strict';

  angular
    .module('app.notifications')
    .directive('notificationsCount', notificationsCount);

  notificationsCount.$inject = ['notificationsService'];

  function notificationsCount(notificationsService) {

    var directive = {
      replace: true,
      template: '<span>{{notifications.totalUnread}}</span>',
      scope: true,
      link: function (scope) {
        scope.notifications = notificationsService;
        return;
      }
    };

    return directive;
  }
})();
