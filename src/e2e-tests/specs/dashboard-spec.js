/* jshint module: true */
var DashboardPage = require('../pages/dashboard-page');
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');

describe('Viewing the dashboard', function () {
  var dashboardPage = new DashboardPage();
  var loginPage = new LoginPage();
  var navObject = new NavObject();

  describe('As a standard user', function () {

    beforeAll(function () {
      loginPage.get();
      loginPage.login();
      navObject.dashboardLink.click();
      browser.wait(dashboardPage.pageHeading.isDisplayed, 10000);
    });

    it('should see the create new list button', function () {
      expect(dashboardPage.createListButton.isPresent()).toBeTruthy();
    });

    it('should not see the manage services button', function () {
      expect(dashboardPage.manageServicesButton.isPresent()).toBeFalsy();
    });

    it('should not see the add new user button', function () {
      expect(dashboardPage.newUserButton.isPresent()).toBeFalsy();
    });

    it('should not see the view OAuth Clients button', function () {
      expect(dashboardPage.oauthButton.isPresent()).toBeFalsy();
    });

    afterAll(function () {
      navObject.logOut();
    });

  });

  describe('As an admin user', function () {

    beforeAll(function () {
      loginPage.get();
      loginPage.loginAdmin();
      navObject.dashboardLink.click();
      browser.wait(dashboardPage.pageHeading.isDisplayed, 10000);
    });

    it('should see the create new list button', function () {
      expect(dashboardPage.createListButton.isPresent()).toBeTruthy();
    });

    it('should see the manage services button', function () {
      expect(dashboardPage.manageServicesButton.isPresent()).toBeTruthy();
    });

    it('should see the add new user button', function () {
      expect(dashboardPage.newUserButton.isPresent()).toBeTruthy();
    });

    it('should see the view OAuth Clients button', function () {
      expect(dashboardPage.oauthButton.isPresent()).toBeTruthy();
    });

    afterAll(function () {
      navObject.logOut();
    });
  });
});
