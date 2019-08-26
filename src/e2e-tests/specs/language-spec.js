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
  });

  it('should change the language to French', function () {
    navObject.openLanguageDropdown();
    navObject.langFR.click();
    navObject.dashboardLink.click();
    var frHeading = element(by.cssContainingText('.page-header__heading', 'Tableau de bord'))
    browser.wait(frHeading.isDisplayed, 10000);
    expect(frHeading.isDisplayed()).toBeTruthy();
  });

  it('should change the language back to English', function () {
    navObject.openLanguageDropdown();
    navObject.langEN.click();
    var enHeading = element(by.cssContainingText('.page-header__heading', 'Dashboard'))
    browser.wait(enHeading.isDisplayed, 10000);
    expect(enHeading.isDisplayed()).toBeTruthy();
  });

  afterAll(function () {
    navObject.logOut();
  });
});
