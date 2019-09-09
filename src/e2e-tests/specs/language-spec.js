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
    loginPage.login();
    navObject.dashboardLink.click();
    browser.sleep(500);
    var dashboardHeading = element(by.cssContainingText('.page-header__heading', 'Dashboard'));
    browser.wait(dashboardHeading.isDisplayed, 10000);
  });

  it('should change the language to French', function () {
    navObject.openLanguageDropdown();
    navObject.langFR.click();
    var frHeading = element(by.css('.page-header__heading'));
    browser.wait(frHeading.isDisplayed, 10000);
    expect(frHeading.getText()).toBe('Tableau de bord');
  });

  it('should change the active language in the Switcher to French', function () {
    expect(navObject.languageButton.getText()).toBe('FR');
    navObject.openLanguageDropdown();
    var activeLanguage = element(by.css('.language-link.active'));
    browser.wait(activeLanguage.isDisplayed, 10000);
    expect(activeLanguage.getText()).toBe('Français');
  });

  it('should change the language back to English', function () {
    navObject.langEN.click();
    var enHeading = element(by.css('.page-header__heading'));
    browser.wait(enHeading.isDisplayed, 1000);
    expect(enHeading.getText()).toBe('Dashboard');
  });

  afterAll(function () {
    navObject.logOut();
  });
});
