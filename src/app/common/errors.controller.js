(function () {
  'use strict';

  angular
    .module('app.common')
    .controller('ErrorsCtrl', ErrorsCtrl);

  ErrorsCtrl.$inject = ['$rootScope', 'alertService', 'config', 'gettextCatalog'];

  function ErrorsCtrl($rootScope, alertService, config, gettextCatalog) {

    function getErrorMessage (rejection) {

      // Too many API requests
      if (rejection.status === 429 && rejection.data.message === 'Rate limit exceeded') {
        return gettextCatalog.getString('You\'ve reached the API request limit, please try again in 10 minutes');
      }

      // Login errors
      if (rejection.config.url.indexOf('jsonwebtoken') !== -1) {
        if (rejection.data && rejection.data.message === 'Please verify your email address') {
          return gettextCatalog.getString('We could not log you in because your email address is not verified yet.');
        }

        if (rejection.data && rejection.data.message === 'invalid email or password') {
          return gettextCatalog.getString('We could not log you in. Please verify your email and password.');
        }

        if (rejection.data && rejection.data.message === 'Email address could not be found') {
         return gettextCatalog.getString('We could not log you in, the email address does not exist.');
        }

        if (rejection.status === 429) {
          return gettextCatalog.getString('Your account has been locked for 5 minutes due to too many unsuccessful login attempts');
        }

        return gettextCatalog.getString('There was an error logging in.');
      }

      // New user create error
      if (rejection.config.url === config.apiUrl + 'user' && rejection.config.method === 'POST') {
        return gettextCatalog.getString('There is an error in your registration. You may have already registered. If so, simply reset your password.');
      }

      // Return error message from API
      if (rejection.data && rejection.data.message) {
        return rejection.data.message;
      }

      // Return generic error message
      return gettextCatalog.getString('Sorry there was an problem making this request, please try again');
    }

    $rootScope.$on('apiRejection', function (event, rejection) {
      var errorMessage = getErrorMessage(rejection);
      alertService.add('danger', errorMessage);
    });
  }
})();
