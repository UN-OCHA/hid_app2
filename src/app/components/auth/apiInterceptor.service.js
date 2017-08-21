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
        }
        return request;
      },

      'responseError': function(rejection) {
        if (Offline.state === 'up') {
          $rootScope.$broadcast('apiRejection', rejection);
        }
        return $q.reject(rejection);
      }
    };
  }
})();
