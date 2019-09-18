/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');

describe('Login', function () {
  var loginPage = new LoginPage();
  var navObject = new NavObject();

  beforeEach(function () {
    loginPage.get();
  });

  describe('Unsuccessful login', function () {
    it('should show an error message', function () {
      loginPage.loginInvalid();
      browser.wait(loginPage.errorModal.isDisplayed(), 5000);
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl);
      expect(loginPage.errorModal.isPresent()).toBeTruthy();
      expect(loginPage.errorModalText.getText()).toBe('We could not log you in. The username or password you have entered are incorrect. Kindly try again.');
    });
  });

  describe('Successful login', function () {
    it('should go to the landing page', function () {
      loginPage.login();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'landing');
    });
  });

  afterAll(function () {
    navObject.logOut();
  });
});
