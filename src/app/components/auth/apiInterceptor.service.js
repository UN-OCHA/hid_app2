(function () {
  'use strict';

  angular
    .module('app.auth')
    .factory('APIInterceptor', APIInterceptor);

  APIInterceptor.$inject = ['$q', '$rootScope', '$window', 'config'];

  function APIInterceptor ($q, $rootScope, $window, config) {

    return {
      request: function(request) {
        var user = JSON.parse($window.localStorage.getItem('currentUser'));
        if (user && user.locale) {
          request.headers['Accept-Language'] = user.locale;
        }

        // Add authorization header only for calls to our API
        if (request.url.indexOf(config.apiUrl) != -1) {
          var token = $window.localStorage.getItem('jwtToken');
          if (token) {
            request.headers.Authorization = 'Bearer ' + token;
          }
          request.withCredentials = true;
        }
        return request;
      },

      'responseError': function(rejection) {
        if (Offline.state === 'up') {
          // 2FA required
          if (rejection.status === 401 && rejection.data.message === 'No TOTP token') {
            return $q.reject(rejection);
          }
          $rootScope.$broadcast('apiRejection', rejection);
        }
        return $q.reject(rejection);
      }
    };
  }
})();
