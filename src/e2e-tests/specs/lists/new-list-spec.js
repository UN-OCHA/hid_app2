/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var NavObject = require('../../pages/nav-object');
var DashboardPage = require('../../pages/dashboard-page');
var NewListPage = require('../../pages/new-list-page');
var ListPage = require('../../pages/list-page');

describe('New Lists', function () {
  var loginPage = new LoginPage();
  var dashboardPage = new DashboardPage();
  var newListPage = new NewListPage();
  var listPage = new ListPage();
  var navObject = new NavObject();

  beforeAll(function () {
    loginPage.get();
    loginPage.login();
  });

  describe('Creating and deleting a list', function () {

    beforeAll(function () {
      navObject.dashboardLink.click();
      browser.wait(dashboardPage.pageHeading.isDisplayed(), 10000);
      dashboardPage.createListButton.click();
      browser.wait(newListPage.pageHeading.isDisplayed(), 10000);
    });

    describe('Creating a new list', function () {

      it('should go to the create list page', function () {
        expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'lists/new');
      });

      it('should save and go to the new list', function () {
        newListPage.populateNewListForm();
        browser.wait(listPage.listTitle.isDisplayed(), 10000);
        expect(listPage.listTitle.getText()).toBe(browser.params.tempList);
      });

      it('should show on the dashboard', function () {
        navObject.dashboardLink.click();
        browser.wait(dashboardPage.pageHeading.isDisplayed(), 10000);
        dashboardPage.listsManageTabBtn.click();
        expect(dashboardPage.listsManage.getText()).toContain(browser.params.tempList);
      });

    });

    describe('Deleting the list', function () {

      beforeAll(function () {
        listPage.goToList(browser.params.tempList);
        listPage.openListAdmin();
        browser.wait(listPage.deleteButton.isDisplayed(), 10000);
        listPage.deleteButton.click();
      });

      it('should ask for confirmation', function () {
        browser.wait(listPage.confirmModal.isDisplayed(), 10000);
        expect(listPage.confirmModal.isPresent()).toBeTruthy();
        listPage.confirmModalButton.click();
      });

      it('should redirect to the lists page', function () {
        expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'lists');
      });

      it('should show the success message', function () {
        browser.wait(listPage.deleteSuccessModalText.isDisplayed(), 10000);
        expect(listPage.deleteSuccessModalText.isPresent()).toBeTruthy();
        listPage.successModalClose.click();
      });
    });

  });

  afterAll(function () {
    navObject.logOut();
  });
});
