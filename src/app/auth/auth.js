var authServices = angular.module('authServices', []);

authServices.factory('AuthService', ['$http', '$window', function ($http, $window) {
  var jwt = {
    login: function(email, password) {
      var promise = $http.post('http://auth.hid.vm/api/v2/jsonwebtoken', { 'email': email, 'password': password }).then(function (response) {
        if (response.data && response.data.token) {
          $window.localStorage.setItem('jwtToken', response.data.token);
          $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
      });
      return promise;
    },

    logout: function() {
      $window.localStorage.removeItem('jwtToken');
      $window.localStorage.removeItem('currentUser');
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

authController.controller('AuthCtrl', ['$scope', '$location', 'alertService', 'AuthService', 'User', function ($scope, $location, alertService, AuthService, User) {
  $scope.login = function() {
    AuthService.login($scope.email, $scope.password).then(function () {
      $scope.initCurrentUser();
      $location.path('/dashboard');
    }, function (data) {
      alertService.add('danger', 'We could not log you in. Please verify your email and password.');
    });
  };

  $scope.logout = function() {
    AuthService.logout();
    $scope.removeCurrentUser();
    $location.path('/');
    alertService.add('success', 'You were successfully logged out.');
  };

  if ($location.path() == '/logout') {
    $scope.logout();
  }
  else if ($location.path() == '/' && $scope.currentUser) {
    $location.path('/dashboard');
  }
}]);
