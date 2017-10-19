(function() {
  'use strict';

  var $timeout, httpBackend, mockConfig, mockUibModal, modalResult, tfaToken, TwoFactorAuthService;
  tfaToken = '123456';

  describe('Two Factor Auth Service', function () {

    beforeEach(function () {

      mockConfig = {
        apiUrl: 'http://mock-url/'
      };

      mockUibModal = {
        open: function() {},
      };
      modalResult = {
        then: function() {}
      };
      spyOn(mockUibModal, 'open').and.returnValue({result: modalResult, opened: modalResult});

      module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.constant('$uibModal', mockUibModal);
      });

      inject(function(_TwoFactorAuthService_, _$httpBackend_, config, _$timeout_) {
        TwoFactorAuthService = _TwoFactorAuthService_;
        httpBackend = _$httpBackend_;
        config = mockConfig;
        $timeout = _$timeout_;
      });

    });

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should generate a QR Code', function () {
      TwoFactorAuthService.generateQRCode();
      httpBackend.expectPOST('http://mock-url/totp/qrcode').respond({});
      httpBackend.flush();
    });

    it('should enable TFA using the token', function () {
      TwoFactorAuthService.enable(tfaToken);
      httpBackend.expectPOST('http://mock-url/totp', {method: 'app'},  {"X-HID-TOTP":tfaToken,"Accept":"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8"}).respond({});
      httpBackend.flush();
    });

    it('should disable TFA using the token', function () {
      TwoFactorAuthService.disable(tfaToken);
      httpBackend.expectDELETE('http://mock-url/totp', {"X-HID-TOTP":tfaToken,"Accept":"application/json, text/plain, */*"}).respond({});
      httpBackend.flush();
    });

    it('should generate recovery codes', function () {
      TwoFactorAuthService.generateRecoveryCodes();
      httpBackend.expectPOST('http://mock-url/totp/codes').respond({});
      httpBackend.flush();
    });

    it('should trust the device', function () {
      TwoFactorAuthService.trustDevice('2', function (){});
      httpBackend.expectPOST('http://mock-url/totp/device').respond({});
      httpBackend.flush();
    });

    it('should delete a trusted device', function () {
      TwoFactorAuthService.deleteTrustedDevice(10);
      httpBackend.expectDELETE('http://mock-url/totp/device/10').respond({});
      httpBackend.flush();
    });

    it('should request a token from the user', function () {
      TwoFactorAuthService.requestToken();
      expect(mockUibModal.open).toHaveBeenCalled();
    });

  });

 })();
