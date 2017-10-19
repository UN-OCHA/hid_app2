(function () {
  'use strict';

  angular
  .module('app.user')
  .factory('TwoFactorAuthService', TwoFactorAuthService);

  TwoFactorAuthService.$inject = ['$http', '$timeout', '$uibModal', 'config'];

  function TwoFactorAuthService($http, $timeout, $uibModal, config) {
    var TwoFactorAuth = {};
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
        },
        withCredentials: true
      };
      $http(req).then(function (response) {
        var cookieValue = response.data['x-hid-totp-trust'];
        document.cookie = 'x-hid-totp-trust=' + cookieValue + ';domain=humanitarian.id';
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

    TwoFactorAuth.requestToken = function (success, error, requestTrustDevice) {
      var twoFAModal;
      twoFAModal = $uibModal.open({
        controller: function ($scope) {
          $scope.requestTrustDevice = requestTrustDevice;
          $scope.tfa = {
            token: '',
            trustDevice: false
          };
          $scope.close = function () {
            twoFAModal.close($scope.tfa);
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
          document.getElementById('token').focus();
        }, 0);
      });

      twoFAModal.result.then(function (tfa) {
        success(tfa.token, tfa.trustDevice);
        return;
      }, function () {
        if (error) { error(); }
        return;
      });
    };

    return TwoFactorAuth;

  }

})();
