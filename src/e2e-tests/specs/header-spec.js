/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');
var CommonDesign = require('../pages/cd-object');

describe('CD Global Header', function () {
  var loginPage = new LoginPage();
  var navObject = new NavObject();
  var commonDesign = new CommonDesign();

  beforeAll(function () {
    loginPage.get();
  });

  describe('viewing OCHA Services', function () {
    it('should show a list of related platforms', function () {
      expect(commonDesign.ochaServicesList.isDisplayed()).toBe(false);
      commonDesign.openOchaServices();
      expect(commonDesign.ochaServicesList.isDisplayed()).toBe(true);
    });
  });
});
