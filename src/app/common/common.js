var appServices = angular.module('appServices', []);

appServices.factory('alertService', function($rootScope) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];

  alertService.add = function(type, msg, confirm = false, cb = false) {
    var closeAlert = function () {
      alertService.closeAlert(this);
    };
    var alert = {
      'type': type,
      'msg': msg, 
      'close': closeAlert,
      'routes': 1,
      'confirm': confirm,
      'callback': cb,
    };
    if (confirm) {
      alert.closeConfirm = closeAlert;
      alert.close = undefined;
    }
    $rootScope.alerts.push(alert);
    return alert;
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

appControllers.controller('AppCtrl', ['$scope', '$location', '$window', function ($scope, $location, $window) {
  $scope.currentUser = null;
  $scope.isAdminCollapsed = true;
  $scope.isAdminAvailable = false;
  $scope.filters = {};

  $scope.switchAdmin = function() {
    $scope.isAdminCollapsed = !$scope.isAdminCollapsed;
  };

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

  $scope.adminExpanding = function () {
    angular.element(document).find('body').addClass('toggled');
  };

  $scope.adminCollapsing = function () {
    angular.element(document).find('body').removeClass('toggled');
  };

  var initAdminAvailable = function () {
    $scope.isAdminAvailable = false;
    $scope.adminCollapsing();
  }

  $scope.setAdminAvailable = function (val) {
    $scope.isAdminAvailable = val;
  };

  $scope.searchUsers = function () {
    $location.path('/users').search({q: $scope.filters.q});
  };

  $scope.initCurrentUser();

  $scope.$on('$routeChangeSuccess', initAdminAvailable);
}]);

