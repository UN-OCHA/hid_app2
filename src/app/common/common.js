var appServices = angular.module('appServices', []);

appServices.factory('alertService', function($rootScope) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];

  alertService.add = function(type, msg) {
    $rootScope.alerts.push({
      'type': type,
      'msg': msg, 
      'close': function() {
        alertService.closeAlert(this);
      },
      'routes': 1
    });
  };

  alertService.closeAlert = function(alert) {
    var i = $rootScope.alerts.indexOf(alert);
    $rootScope.alerts.splice(i, 1);
  };

  alertService.nextRoute = function() {
    for (var i = $rootScope.alerts.length - 1; i >= 0; i--) {
      if ($rootScope.alerts[i].routes > 1) {
        $rootScope.alerts.splice(i,1);
      }
      else {
        $rootScope.alerts[i].routes++;
      }
    }
  };

  return alertService;
});

var appControllers = angular.module('appControllers', []);

appControllers.controller('AppCtrl', ['$scope', '$window', function ($scope, $window) {
  $scope.currentUser = null;

  $scope.removeCurrentUser = function() {
    $scope.currentUser = null;
  };

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };

  $scope.initCurrentUser = function () {
    if ($window.localStorage.getItem('currentUser')) {
      $scope.setCurrentUser(JSON.parse($window.localStorage.getItem('currentUser')));
    }
  };

  $scope.initCurrentUser();
}]);

