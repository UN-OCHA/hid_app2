/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var ProfilePage = require('../../pages/profile-page');
var NavObject = require('../../pages/nav-object');

describe('User verification', function () {
  var loginPage = new LoginPage();
  var profilePage = new ProfilePage();
  var navObject = new NavObject();

  beforeAll(function () {
    loginPage.get();
    loginPage.loginAdmin();
    navObject.searchInput.sendKeys(browser.params.userName);
    browser.wait(navObject.searchAutocomplete.isDisplayed, 1000);
    var el = element(by.cssContainingText('.search-autocomplete__item a', browser.params.userName));
    el.click();
    browser.wait(profilePage.userName.isDisplayed, 10000);
  });

  describe('Verifying a user', function () {

    beforeAll(function () {
      browser.wait(profilePage.adminButton.isDisplayed, 10000);
      browser.sleep(500);
      profilePage.adminButton.click();
      browser.wait(profilePage.adminSidebar.isDisplayed, 10000);
      browser.sleep(500);
      profilePage.verifyButton.click();
    });

    it('should show the success message', function () {
      browser.wait(profilePage.modalOverlay.isDisplayed, 10000);
      expect(profilePage.verifyModalText.getText()).toContain('User updated');
    });

    it('should change the button to "un-verify"', function () {
      profilePage.modalOverlay.click();
      browser.sleep(500)
      profilePage.verifyButton.getText().then(function(str) {
        expect(str.toLowerCase()).toBe('un-verify user');
      });
    });

    it('should show verified tick on their profile', function () {
      profilePage.adminButton.click();
      browser.sleep(500);
      expect(profilePage.verifiedTick.isDisplayed()).toBeTruthy();
    });

  });

  describe('Un-verifying a user', function () {

    beforeAll(function () {
      profilePage.adminButton.click();
      browser.wait(profilePage.adminSidebar.isDisplayed, 10000);
      browser.sleep(500);
      profilePage.verifyButton.click();
    });

    it('should show the success message', function () {
      browser.wait(profilePage.modalOverlay.isDisplayed, 10000);
      browser.sleep(500);
      expect(profilePage.verifyModalText.isPresent()).toBeTruthy();
    });

    it('should change the button to "verify"', function () {
      profilePage.modalOverlay.click();
      browser.sleep(500);
      profilePage.verifyButton.getText().then(function(str) {
        expect(str.toLowerCase()).toBe('verify user');
      });
    });

    it('should not show verified tick on their profile', function () {
      profilePage.adminButton.click();
      browser.sleep(500);
      expect(profilePage.verifiedTick.isDisplayed()).toBeFalsy();
    });

  });

  afterAll(function () {
    navObject.logOut();
  });

});
