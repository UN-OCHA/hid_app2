/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var NavObject = require('../../pages/nav-object');
var NewListPage = require('../../pages/new-list-page');
var ListPage = require('../../pages/list-page');

describe('List members', function () {
	var loginPage = new LoginPage();
	var newListPage = new NewListPage();
	var listPage = new ListPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	  newListPage.createList();
	});

	describe('Adding and removing people to list', function () {

		describe('Add a person to the list', function () {

			beforeAll(function() {
				listPage.openListAdmin();
			});

			it('should search for the user', function () {
				browser.wait(listPage.addMemberInput.isDisplayed(), 5000);
				listPage.addMemberInput.sendKeys(browser.params.adminUserName);
				var results = element(by.css('.ui-select-choices'));
				browser.wait(results.isDisplayed(), 5000);
				expect(results.getText()).toContain(browser.params.adminUserName);
			});

			it('should add the user to the list', function () {
				listPage.addMemberResult.click();
				listPage.addMemberButton.click();
				browser.wait(listPage.successModal.isDisplayed(), 5000);
				expect(listPage.addMemberSuccessModalText.isPresent()).toBeTruthy();
				listPage.modalOverlay.click();
				listPage.adminButton.click();
				expect(listPage.listUsers.getText()).toContain(browser.params.adminUserName);
			});

		});

		describe('Remove a person from the list', function () {

			beforeAll(function() {
				// browser.sleep(1000);
				browser.wait(listPage.userOptionsButton.isDisplayed(), 5000);
				listPage.userOptionsButton.click();
				browser.wait(listPage.removeFromListButton.isDisplayed(), 5000);
				listPage.removeFromListButton.click();
			});

			it('should ask for confirmation', function () {
				browser.wait(listPage.confirmModal.isDisplayed(), 5000);
				expect(listPage.confirmModal.isPresent()).toBeTruthy();
				listPage.confirmModalButton.click();
			});

			it('should show the success message', function () {
				browser.wait(listPage.successModal.isDisplayed(), 5000);
				expect(listPage.removeSuccessModalText.isPresent()).toBeTruthy();
			});

			it('should remove the user from the list users', function () {
				listPage.modalOverlay.click();
				expect(listPage.listUsers.getText()).not.toContain(browser.params.adminUserName);
			});

		});
	});

	afterAll(function () {
		listPage.deleteList();
		browser.sleep(3000); //wait for modals to close
		navObject.logOut();
	});

});
