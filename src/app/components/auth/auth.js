var authServices = angular.module('authServices', []);

authServices.factory('AuthService', ['$http', '$window', '$rootScope', '$interval', 'config', 'offlineService', function ($http, $window, $rootScope, $interval, config, offlineService) {
  var jwt = {
    login: function(email, password) {
      var promise = $http.post(config.apiUrl + 'jsonwebtoken', { 'email': email, 'password': password }).then(function (response) {
        if (response.data && response.data.token) {
          $window.localStorage.setItem('jwtToken', response.data.token);
          $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          offlineService.cacheListsForUser(response.data.user);
          $rootScope.offlinePromise = $interval(function () {
            offlineService.cacheListsForUser(response.data.user)
          }, 60000);
        }
      });
      return promise;
    },

    logout: function() {
      $window.localStorage.removeItem('jwtToken');
      $window.localStorage.removeItem('currentUser');
      $interval.cancel($rootScope.offlinePromise);
    },

    getToken: function() {
      return $window.localStorage.getItem('jwtToken');
    },

    isAuthenticated: function() {
      var token = jwt.getToken();
      if (token) {
        var parsed = this.parseToken(token);
        var current = Date.now() / 1000;
        current = parseInt(current);
        if (parsed.exp <= current) {
          return false;
        }
        else {
          return true;
        }
      }
      else {
        return false;
      }
    },

    parseToken: function (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    },
  };
  return jwt;
}]);

authServices.factory('APIInterceptor', ['$window', 'config', function ($window, config) {
  return {
    request: function(request) {
      // Add authorization header only for calls to our API
      if (request.url.indexOf(config.apiUrl) != -1) {
        var token = $window.localStorage.getItem('jwtToken');
        if (token) {
          request.headers.Authorization = 'Bearer ' + token;
        }
      }
      return request;
    }
  }
}]);


var authController = angular.module('authController', []);

authController.controller('AuthCtrl', ['$scope', '$routeParams', '$location', '$http', 'gettextCatalog', 'alertService', 'AuthService', 'User', function ($scope, $routeParams, $location, $http, gettextCatalog, alertService, AuthService, User) {
  $scope.email = '';
  $scope.login = function() {
    AuthService.login($scope.email, $scope.password).then(function () {
      $scope.initCurrentUser();
      $location.path('/landing');
    }, function (data) {
      if (data.message == 'Please verify your email address') {
        alertService.add('danger', gettextCatalog.getString('We could not log you in because your email address is not verified yet.'));
      }
      else {
        alertService.add('danger', gettextCatalog.getString('We could not log you in. Please verify your email and password.'));
      }
    });
  };

  $scope.logout = function() {
    AuthService.logout();
    $scope.removeCurrentUser();
    $location.path('/');
    alertService.add('success', gettextCatalog.getString('You were successfully logged out.'));
  };

  $scope.passwordReset = function() {
    var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
    User.passwordReset($scope.email, function (response) {
      alertService.add('success', gettextCatalog.getString('You will soon receive an email which will allow you to reset your password.'));
      $scope.reset.$setPristine();
    }, function (response) {
      alertService.add('danger', gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.'));
      $scope.reset.$setPristine();
    });
  };

  $scope.resetPasswordFunction = function() {
    User.resetPassword($location.search().hash, $scope.newPassword, function (response) {
      alertService.add('success', gettextCatalog.getString('Your password was successfully changed. You can now login.'));
      $location.path('/');
    }, function (response) {
      alertService.add('danger', gettextCatalog.getString('There was an error resetting your password. Please try again or contact the HID team.'));
      $scope.resetPassword.$setPristine();
    });
  };

  if ($location.path() == '/logout') {
    $scope.logout();
  }
  else if ($location.path() == '/' && $scope.currentUser) {
    $location.path('/landing');
  }
}]);

authController.controller('VerifyCtrl', ['$scope', '$location', '$routeParams', 'User', 'gettextCatalog', 'alertService', function ($scope, $location, $routeParams, User, gettextCatalog, alertService) {
  var hash = $location.search().hash;
  User.validateEmail(hash, function (response) {
    alertService.add('success', gettextCatalog.getString('Thank you for verifying your email. You can now login through our application, or through any other application using Humanitarian ID'));
    $location.path('/');
  }, function (response) {
    alertService.add('danger', gettextCatalog.getString('The verification link did not work'));
  });
}]);
