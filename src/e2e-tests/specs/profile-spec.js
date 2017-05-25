/* jshint module: true */
var LoginPage = require('../pages/login-page');
var ProfilePage = require('../pages/profile-page');
var NavObject = require('../pages/nav-object');

describe('Profile', function () {
	var loginPage = new LoginPage();
	var profilePage = new ProfilePage();
	var navObject = new NavObject();
	var defaultStatus = 'I am a test user, do not delete me.';

	function resetProfile () {
		profilePage.editButton.click();
		profilePage.statusInput.clear();
		profilePage.statusInput.sendKeys(defaultStatus);
		profilePage.closeEditButton.click();
	}

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	  navObject.openUserDropdown();
		navObject.profileLink.click();
	});

	describe('Viewing own profile', function () {

		it('should show the user name', function () {
			expect(profilePage.userName.getText()).toBe(browser.params.userName);
		});

		it('should show the user status', function () {
			expect(profilePage.userStatus.getText()).toBe(defaultStatus);
		});

		it('should show the edit button', function () {
			expect(profilePage.editButton.isPresent()).toBeTruthy();
		});

	});

	describe('Editing profile', function () {

		it('should show the edit profile fields when click the edit button', function () {
			expect(profilePage.statusInput.isDisplayed()).toBeFalsy();
			expect(profilePage.newEmailInput.isDisplayed()).toBeFalsy();
			profilePage.editButton.click();
			expect(profilePage.statusInput.isDisplayed()).toBeTruthy();
			expect(profilePage.newEmailInput.isDisplayed()).toBeTruthy();
		});

		describe('Editing your status', function () {

			it('should show the saving message', function () {
				profilePage.statusInput.sendKeys('I am new');
				expect(profilePage.profileAlert.isDisplayed()).toBeTruthy();
			});

			it('should show the new status', function () {
				profilePage.closeEditButton.click();
				expect(profilePage.userStatus.getText()).toBe(defaultStatus + 'I am new');
			});

		});

		afterAll(function () {
			resetProfile();
		});

	});

	describe('Viewing another users profile', function () {

		beforeAll(function () {
			navObject.searchInput.sendKeys(browser.params.adminUserName);
			browser.wait(navObject.searchAutocomplete.isDisplayed(), 1000);
			var result = element(by.repeater('result in searchPeople').row(0));
			result.click();
			browser.wait(profilePage.userName.isDisplayed(), 10000);
		});

		it('should show the user name', function () {
			expect(profilePage.userName.getText()).toBe(browser.params.adminUserName);
		});

		it('should not show the edit profile button', function () {
			expect(profilePage.editButton.isPresent()).toBeFalsy();
		});

	});

	afterAll(function () {
		navObject.logOut();
	});

});
