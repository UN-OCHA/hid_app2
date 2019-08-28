/* jshint module: true */
var LoginPage = require('../pages/login-page');
var DashboardPage = require('../pages/dashboard-page');
var NavObject = require('../pages/nav-object');

describe('Language switcher', function () {
  var loginPage = new LoginPage();
  var dashboardPage = new DashboardPage();
  var navObject = new NavObject();

  beforeAll(function () {
    loginPage.get();
  });

  it('should change the language to French', function () {
    navObject.openLanguageDropdown();
    navObject.langFR.click();
    var frHeading = element(by.css('label[for="email"]'));
    browser.wait(frHeading.isDisplayed, 1000);
    expect(frHeading.getText()).toBe('Courriel');
  });

  it('should change the active language in the Switcher to French', function () {
    expect(navObject.languageButton.getText()).toBe('FR');
    navObject.openLanguageDropdown();
    var activeLanguage = element(by.css('.language-link.active'));
    browser.wait(activeLanguage.isDisplayed, 1000);
    expect(activeLanguage.getText()).toBe('Français');
  });

  it('should change the language back to English', function () {
    navObject.langEN.click();
    var enHeading = element(by.css('label[for="email"]'));
    browser.wait(enHeading.isDisplayed, 1000);
    expect(enHeading.getText()).toBe('Email');
  });
});
