(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('LandingCtrl', LandingCtrl);

  LandingCtrl.$inject = ['$scope', 'notificationsService'];

  function LandingCtrl($scope, notificationsService) {
    $scope.notifications = notificationsService;
  }
})();
