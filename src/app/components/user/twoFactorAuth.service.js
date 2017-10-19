(function () {
  'use strict';

  angular
  .module('app.user')
  .factory('TwoFactorAuth', TwoFactorAuth);

  TwoFactorAuth.$inject = ['$cookies', '$http', '$timeout', '$uibModal', 'config'];

  function TwoFactorAuth($cookies, $http, $timeout, $uibModal, config) {

    TwoFactorAuth.generateQRCode = function (success, error) {
      $http.post(config.apiUrl + 'totp/qrcode').then(success, error);
    };

    TwoFactorAuth.enable = function (token, success, error) {
      var req = {
        method: 'POST',
        url: config.apiUrl + 'totp',
        headers: {
          'X-HID-TOTP': token
        },
        data: {method: 'app'}
      };
      $http(req).then(success, error);
    };

    TwoFactorAuth.disable = function (token, success, error) {
      var req = {
        method: 'DELETE',
        url: config.apiUrl + 'totp',
        headers: {
          'X-HID-TOTP': token
        }
      };
      $http(req).then(success, error);
    };

    TwoFactorAuth.generateRecoveryCodes = function (success, error) {
      $http.post(config.apiUrl + 'totp/codes').then(success, error);
    };

    TwoFactorAuth.trustDevice = function (token, success, error) {
      var req = {
        method: 'POST',
        url: config.apiUrl + 'totp/device',
        headers: {
          'X-HID-TOTP': token
        }
      };
      $http(req).then(function (response) {
        var cookieValue = response.data['x-hid-totp-trust'];
        $cookies.put('x-hid-totp-trust', cookieValue);
        success();
      }, error);
    };

    TwoFactorAuth.deleteTrustedDevice = function (id, success, error) {
      var req = {
        method: 'DELETE',
        url: config.apiUrl + 'totp/device/' + id,
      };
      $http(req).then(success, error);
    };

    TwoFactorAuth.requestToken = function (success, error) {
      var twoFAModal;
      twoFAModal = $uibModal.open({
        controller: function ($scope) {
          $scope.close = function () {
            twoFAModal.close($scope.token);
          };
          $scope.dismiss = function () {
            twoFAModal.dismiss();
          };
        },
        size: 'sm',
        templateUrl: 'app/components/user/twoFactorAuthModal.html',
      });

      twoFAModal.opened.then(function () {
        $timeout(function () {
          document.getElementById('code').focus();
        }, 0);
      });

      twoFAModal.result.then(function (token) {
        success(token);
        return;
      }, function () {
        error();
        return;
      });
    };

    return TwoFactorAuth;

  }

})();
