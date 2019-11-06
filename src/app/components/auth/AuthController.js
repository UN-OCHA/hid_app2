(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$location', '$timeout', '$window', 'alertService', 'AuthService', 'gettextCatalog', 'TwoFactorAuthService'];

  function AuthController ($exceptionHandler, $rootScope, $scope, $location, $timeout, $window, alertService, AuthService, gettextCatalog, TwoFactorAuthService) {
    var thisScope = $scope;
    thisScope.email = '';
    thisScope.saving = false;
    var twoFAModal;

    function onFirstLogin () {
      thisScope.currentUser.setAppMetaData({login: true});
      thisScope.currentUser.authOnly = false;
      thisScope.currentUser.$update(function () {
        thisScope.setCurrentUser(thisScope.currentUser);
        $location.path('/start');
      });
    }

    function successfullLogin () {
      thisScope.initCurrentUser();
      thisScope.saving = false;
      $window.localStorage.setItem('hidResetPassword', true);

      if (thisScope.currentUser.appMetadata && thisScope.currentUser.appMetadata.hid) {

        // New user first login (login is set to false in registration)
        if (!thisScope.currentUser.appMetadata.hid.login) {
          onFirstLogin();
          //$location.path('/start');
          return;
        }

        //HIDv1 user first login (login is already set to true)
        if (thisScope.currentUser.appMetadata.hid.login && !thisScope.currentUser.appMetadata.hid.viewedTutorial) {
          $location.path('/tutorial');
          return;
        }

        // User has logged in previously
        var redirectUri = $location.search();
        if (!redirectUri.redirect) {
          $location.path('/landing');
        }
        else {
          $location.path(redirectUri.redirect);
          $location.search('redirect', null);
        }
        return;
      }

      // Users registering via auth dont have metadata set until first login
      onFirstLogin();
      //$location.path('/start');
    }

    thisScope.login = function(tfaCode, trustDevice) {
      if (twoFAModal) {
        twoFAModal.close();
      }
      thisScope.saving = true;
      AuthService.login(thisScope.email, thisScope.password, tfaCode).then(function (response) {

        if (trustDevice) {
          TwoFactorAuthService.trustDevice(tfaCode, function () {
            successfullLogin();
          }, function (error) {
            $exceptionHandler(error, 'Trust device fail');
            successfullLogin();
          });
          return;
        }

        // 2FA required
        if (response && response.data.statusCode === 401 && response.data.message === 'No TOTP token') {
          TwoFactorAuthService.requestToken(function (token, trustDevice) {
            thisScope.login(token, trustDevice);
          }, function () {
            thisScope.saving = false;
          }, true);
          return;
        }

        successfullLogin();

      }, function (error) {
        thisScope.saving = false;
        $exceptionHandler(error, 'Log in fail');
      });
    };

    thisScope.logout = function() {
      AuthService.logout();
      thisScope.removeCurrentUser();
      $location.path('/');
      alertService.add('success', gettextCatalog.getString('You were successfully logged out.'));
    };

    $rootScope.$on('tokenExpired', function (event) {
      thisScope.logout();
    });

    if ($location.path() == '/logout') {
      thisScope.logout();
    }
    else if ($location.path() == '/' && thisScope.currentUser) {
      var redirectUri = $location.search();
      if (!redirectUri.redirect) {
        $location.path('/landing');
      }
      else {
        $location.path(redirectUri.redirect);
      }
    }
  }
})();
