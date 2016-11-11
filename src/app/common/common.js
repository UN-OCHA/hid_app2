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

appServices.factory('hrinfoService', function ($http, config) {
  var countriesPromise, rolesPromise;
  return {
    getCountries: function() {
      if (!countriesPromise) {
        countriesPromise = $http.get('https://www.humanitarianresponse.info/hid/locations/countries').then(
          function (response) {
            var countries = [];
            for (var key in response.data) {
              countries.push({
                'id': key,
                'name': response.data[key]
              });
            }
            return countries;
          }
        );
      }
      return countriesPromise;
    },

    getRegions: function (ctry) {
      return $http.get('https://www.humanitarianresponse.info/hid/locations/' + ctry).then(
        function (response) {
          var regions = [];
          for (var key in response.data.regions) {
            regions.push({
              'id': key,
              'name': response.data.regions[key].name
            });
          }
          return regions;
        }
      );
    },

    getRoles: function () {
      if (!rolesPromise) {
        rolesPromise = $http.get(config.hrinfoUrl + '/functional_roles').then(function (resp) {
          return resp.data.data;
        });
      }
      return rolesPromise;
    }
  }
});

var appControllers = angular.module('appControllers', []);

appControllers.controller('AppCtrl', ['$scope', '$location', '$window', 'User', 'userService', 'listService',  function ($scope, $location, $window, User, userService, listService) {
  $scope.currentUser = null;
  $scope.currentUserResource = null;
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
    $window.localStorage.setItem('currentUser', JSON.stringify(user));
  };

  $scope.saveCurrentUser = function() {
    var prom = $scope.getCurrentUserResource().$promise;
    prom.then(function () {
      angular.copy($scope.currentUser, $scope.currentUserResource);
      $scope.currentUserResource.$save();
    });
    return prom;
  };

  $scope.getCurrentUserResource = function () {
    if (!$scope.currentUserResource) {
      $scope.currentUserResource = User.get({userId: $scope.currentUser.id});
    }
    return $scope.currentUserResource;
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

  $scope.initCurrentUser();

  $scope.$on('$routeChangeSuccess', initAdminAvailable);
}]);

