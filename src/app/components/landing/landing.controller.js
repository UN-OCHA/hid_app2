(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('LandingCtrl', LandingCtrl);

  LandingCtrl.$inject = ['$scope', 'notificationsService', 'SearchService'];

  function LandingCtrl($scope, notificationsService, SearchService) {
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

    $scope.saveSearch = function (searchResult, type) {
      SearchService.saveSearch($scope.currentUser, searchResult, type, function (user) {
        $scope.setCurrentUser(user);
      });
    };
  }
})();
