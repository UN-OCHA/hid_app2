var appServices = angular.module('appServices', []);

appServices.factory('alertService', function($rootScope) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];

  alertService.add = function(type, msg, confirm, cb) {
    confirm = confirm || false;
    cb = cb || false;
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

appControllers.controller('AppCtrl', ['$rootScope', '$scope', '$location', '$window', 'User', 'userService', 'listService',  function ($rootScope, $scope, $location, $window, User, userService, listService) {
  $scope.currentUser = null;
  $scope.currentUserResource = null;
  $scope.filters = {};

  $scope.sidebar = {
    open: false,
    sidebars: {
      admin: false,
      userFilters: false
    }
  };

  $scope.hideHeaderFooter = $location.path() === '/styleguide';

  $scope.closeSidebar = function () {
    $scope.sidebar.open = false;
    $rootScope.$emit('sidebar-closed');
  }

  $scope.toggleSidebar = function (name) {
    if ($scope.sidebar.sidebars[name] && $scope.sidebar.open) {
      $scope.sidebar.open = false;
      $rootScope.$emit('sidebar-closed');
      return;
    }
    $scope.sidebar.open = true;
    angular.forEach($scope.sidebar.sidebars, function(value, key) {
      $scope.sidebar.sidebars[key] = name === key ? true : false;
    });
  }

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

  $scope.activeNav = function (path) {
    return $location.path() === path;
  };

  var initView = function () {
    $scope.closeSidebar();
    $scope.hideHeaderFooter = $location.path() === '/styleguide';
  }

  $scope.initCurrentUser();

  $scope.$on('$routeChangeSuccess', initView);
}]);

