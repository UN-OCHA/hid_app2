(function () {
  'use strict';

  angular
  .module('app.user')
  .factory('TwoFactorAuth', TwoFactorAuth);

  TwoFactorAuth.$inject = ['$resource', '$http', '$location', '$window', 'config'];

  function TwoFactorAuth($resource, $http, $location, $window, config) {

    TwoFactorAuth.generateQRCode = function (success, error) {
      $http.post(config.apiUrl + 'totp/qrcode').then(success, error);
    }

    TwoFactorAuth.enable = function (code, success, error) {
      var req = {
        method: 'POST',
        url: config.apiUrl + 'totp',
        headers: {
          'X-HID-TOTP': code
        },
        data: {method: 'app'}
      }
      $http(req).then(success, error);
    }

    TwoFactorAuth.disable = function (code, success, error) {
      console.log('disable')
      var req = {
        method: 'DELETE',
        url: config.apiUrl + 'totp',
        headers: {
          'X-HID-TOTP': code
        }
      }
      $http(req).then(success, error);
    }

    TwoFactorAuth.generateRecoveryCodes = function (success, error) {
      console.log('generateRecoveryCodes');
      $http.post(config.apiUrl + 'totp/codes').then(success, error);
    }

    TwoFactorAuth.trustDevice = function (code, success, error) {
      var req = {
        method: 'POST',
        url: config.apiUrl + 'totp/device',
        headers: {
          'X-HID-TOTP': code
        }
      }
      $http(req).then(success, error);
    }

    TwoFactorAuth.deleteTrustedDevice = function (success, error) {
      var req = {
        method: 'DELETE',
        url: config.apiUrl + 'totp/device',
      }
      $http(req).then(success, error);
    }

    return TwoFactorAuth;

  }

})();
