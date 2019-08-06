(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$location', '$scope', 'notificationsService'];

  function LandingController($location, $scope, notificationsService) {
    $scope.notifications = notificationsService;

    $scope.recentUserSearches = [];
    $scope.recentListSearches = [];
    $scope.recentOperationSearches = [];

    if ($scope.currentUser.appMetadata && $scope.currentUser.appMetadata.hid && $scope.currentUser.appMetadata.hid.recentSearches) {

      if ($scope.currentUser.appMetadata.hid.recentSearches.user) {
        $scope.recentUserSearches = $scope.currentUser.appMetadata.hid.recentSearches.user;
      }

      if ($scope.currentUser.appMetadata.hid.recentSearches.list) {
        $scope.recentListSearches = $scope.currentUser.appMetadata.hid.recentSearches.list;
      }

      if ($scope.currentUser.appMetadata.hid.recentSearches.operation) {
        $scope.recentOperationSearches = $scope.currentUser.appMetadata.hid.recentSearches.operation;
      }

    }

    $scope.readNotification = function (notification) {
      notification.notified = true;
      notification.read = true;
      notificationsService.update(notification);
      $location.path(notification.link);
    };
  }
})();
