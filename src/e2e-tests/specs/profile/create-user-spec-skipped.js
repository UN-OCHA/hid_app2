// Skipping this as can't create a user with an email that's been used before.

/* jshint module: true */
var DashboardPage = require('../../pages/dashboard-page');
var LoginPage = require('../../pages/login-page');
var NewUserPage = require('../../pages/new-user-page');
var NavObject = require('../../pages/nav-object');

fdescribe('Create new user as an admin', function () {
	var dashboardPage = new DashboardPage();
	var loginPage = new LoginPage();
	var newUserPage = new NewUserPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.loginAdmin();
	  navObject.dashboardLink.click();
	  browser.wait(dashboardPage.pageHeading.isDisplayed, 10000);
	});

	describe('Creating a new user', function () {

		it('should go to the create user form', function () {
			dashboardPage.newUserButton.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'users/new');
		});

		it('should save the new user and go to their profile', function () {
 			newUserPage.populateNewUserForm();
 			browser.wait(newUserPage.modalOverlay.isDisplayed, 10000);
			expect(newUserPage.successModalText.isPresent()).toBeTruthy();
			newUserPage.modalOverlay.click();

			var newUserHeading = element(by.cssContainingText('.page-header__heading', browser.params.tempUserFirstName + ' ' + browser.params.tempUserLastName));
			browser.wait(newUserHeading.isDisplayed, 10000);
			expect(newUserHeading.isDisplayed()).toBeTruthy();
		});



	});

	describe('Deleting user', function () {

	});

	afterAll(function () {
		navObject.logOut();
	});

});
