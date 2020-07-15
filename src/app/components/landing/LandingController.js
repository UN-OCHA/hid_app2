(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$window', '$location', '$scope', 'notificationsService'];

  function LandingController($window, $location, $scope, notificationsService) {
    var thisScope = $scope;
    thisScope.notifications = notificationsService;

    thisScope.recentUserSearches = [];
    thisScope.recentListSearches = [];
    thisScope.recentOperationSearches = [];

    if (thisScope.currentUser.appMetadata && thisScope.currentUser.appMetadata.hid && thisScope.currentUser.appMetadata.hid.recentSearches) {
      if (thisScope.currentUser.appMetadata.hid.recentSearches.user) {
        thisScope.recentUserSearches = thisScope.currentUser.appMetadata.hid.recentSearches.user;
      }

      if (thisScope.currentUser.appMetadata.hid.recentSearches.list) {
        thisScope.recentListSearches = thisScope.currentUser.appMetadata.hid.recentSearches.list;
      }

      if (thisScope.currentUser.appMetadata.hid.recentSearches.operation) {
        thisScope.recentOperationSearches = thisScope.currentUser.appMetadata.hid.recentSearches.operation;
      }
    }

    if ($window.navigator.userAgent.indexOf('Cordova') !== -1) {
      thisScope.nativeApp = true;
    } else {
      thisScope.nativeApp = false;
    }

    thisScope.readNotification = function (notification) {
      notification.notified = true;
      notification.read = true;
      notificationsService.update(notification);
      $location.path(notification.link);
    };
  }
})();
