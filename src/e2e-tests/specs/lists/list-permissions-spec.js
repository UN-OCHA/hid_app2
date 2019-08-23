/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var ListPage = require('../../pages/list-page');
var NavObject = require('../../pages/nav-object');

describe('List permissions', function () {
  var loginPage = new LoginPage();
  var listPage = new ListPage();
  var navObject = new NavObject();

  describe('List is viewable by verified users only', function () {

    beforeAll(function () {
      loginPage.get();
      loginPage.login();
    });

    describe('Un-verfied user', function () {
      it('should not see verified-only lists in autocomplete', function () {
        navObject.searchInput.sendKeys(browser.params.lockedTestList);
        var autocompleteResult = element(by.css('.search-autocomplete__item'));
        expect(autocompleteResult.getText()).toBe('No results found');
      });

      // If we directly load a list by knowing its ID in advance, these tests
      // can be used. But in August 2019, the `goToList` function cannot load
      // a list that the user is prevented from viewing, because it doesn't
      // appear in the autocomplete at all.
      // it('should see the verified only message', function () {
      //   expect(listPage.lockedListMessage.isPresent()).toBeTruthy();
      // });

      // it('should not see the list users', function () {
      //   expect(listPage.usersTable.isDisplayed()).toBeFalsy();
      // });

      afterAll(function () {
        navObject.logOut();
      });

    });

    describe('Verfied user', function () {

      beforeAll(function () {
        loginPage.get();
        loginPage.loginAdmin();
        listPage.goToList(browser.params.lockedTestList);
      });

      it('should not see the verified only message', function () {
        expect(listPage.lockedListMessage.isPresent()).toBeFalsy();
      });

      it('should see the list users', function () {
        expect(listPage.usersTable.isDisplayed()).toBeTruthy();
      });

    });

  });

  afterAll(function () {
    navObject.logOut();
  });

});
