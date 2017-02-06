(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('LandingCtrl', LandingCtrl);

  LandingCtrl.$inject = ['$scope', 'notificationsService'];

  function LandingCtrl($scope, notificationsService) {
    $scope.notifications = notificationsService;

    $scope.recentUserSearches = [];
    $scope.recentListSearches = [];

    if ($scope.currentUser.appMetadata && $scope.currentUser.appMetadata.hid) {

      if ($scope.currentUser.appMetadata.hid.recentUserSearches) {
        $scope.recentUserSearches = $scope.currentUser.appMetadata.hid.recentUserSearches;
      }

      if ($scope.currentUser.appMetadata.hid.recentListSearches) {
        $scope.recentListSearches = $scope.currentUser.appMetadata.hid.recentListSearches;
      }

    }
  }
})();
