(function () {
  'use strict';

  angular
    .module('app.common')
    .controller('ErrorsCtrl', ErrorsCtrl);

  ErrorsCtrl.$inject = ['$rootScope', 'alertService', 'config', 'gettextCatalog'];

  function ErrorsCtrl($rootScope, alertService, config, gettextCatalog) {
    // Some errors are better handled by other parts of the app (e.g. a template
    // or other custom handling of errors). This variable lets us suppress the
    // modal when such specific cases are caught.
    var NO_MODAL_DISPLAY = 'no-modal-display';

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
          return gettextCatalog.getString('We could not log you in. The username or password you have entered are incorrect. Kindly try again.');
        }

        if (rejection.data && rejection.data.message === 'Email address could not be found') {
         return gettextCatalog.getString('We could not log you in, the email address does not exist.');
        }

        if (rejection.data && rejection.data.message === 'password is expired') {
          return gettextCatalog.getString('We could not log you in because your password is expired. Following UN regulations, as a security measure passwords must be updated every six months. Kindly reset your password by clicking on the "Forgot/Reset password" link below.');
        }

        if (rejection.status === 429) {
          return gettextCatalog.getString('Your account has been locked for 5 minutes due to too many unsuccessful login attempts');
        }

        return gettextCatalog.getString('There was an error logging in.');
      }

      // New user create error
      if (rejection.config.url === config.apiUrl + 'user' && rejection.config.method === 'POST') {
        return gettextCatalog.getString('There is an error in your registration. You may have already registered. If so, simply <a href="/password_reset" target="_top">reset your password</a>.');
      }

      // List not found — the template shows a good error message so we will
      // suppress the modal from displaying.
      if (rejection.config.method === 'GET' && rejection.config.url.indexOf('/list/')) {
        return NO_MODAL_DISPLAY;
      }

      // Return error message from API
      if (rejection.data && rejection.data.message) {
        return rejection.data.message;
      }

      // Return generic error message only on non GET requests
      if (rejection.config.method !== 'GET') {
        return gettextCatalog.getString('Sorry there was an problem making this request, please try again');
      }
      else {
        return '';
      }
    }

    $rootScope.$on('apiRejection', function (event, rejection) {
      var errorMessage = getErrorMessage(rejection);

      if (errorMessage && errorMessage !== NO_MODAL_DISPLAY) {
        alertService.add('danger', errorMessage, false, null, 0);
      }
    });
  }
})();
