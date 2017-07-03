/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var ProfilePage = require('../../pages/profile-page');
var PreferencesPage = require('../../pages/preferences-page');
var NavObject = require('../../pages/nav-object');

describe('Connections', function () {
	var loginPage = new LoginPage();
	var profilePage = new ProfilePage();
	var preferencesPage = new PreferencesPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	  navObject.searchInput.sendKeys(browser.params.adminUserName);
		browser.wait(navObject.searchAutocomplete.isDisplayed, 1000);
		var el = element(by.cssContainingText('.search-autocomplete__item a', browser.params.adminUserName));
		el.click();
		browser.wait(profilePage.adminUserName.isDisplayed(), 10000);
	});

	describe('Request to view a user\'s phone number', function () {

		it('should show connection required message', function () {
			browser.wait(profilePage.phonePermissionButton.isDisplayed, 10000);
			expect(profilePage.phonePermissionButton.getText()).toContain('Request Test Admin E2E\'s phone number');
		});

		it('should send the connection request', function () {
			profilePage.connectButton.click();
			browser.wait(profilePage.modalOverlay.isDisplayed, 10000);
			expect(profilePage.connectModalText.isPresent()).toBeTruthy();
			profilePage.modalOverlay.click();
			browser.wait(profilePage.phonePermissionMessage.isDisplayed, 10000);
			expect(profilePage.phonePermissionMessage.getText()).toContain('Your connection request is pending');
		});

	});

	describe('Approving a connection request', function () {

		beforeAll(function () {
			navObject.logOut();
			loginPage.get();
	  	loginPage.loginAdmin();
	  	navObject.openUserDropdown();
	  	navObject.preferencesLink.click();
	  	browser.wait(preferencesPage.pageHeading.isDisplayed, 10000);
		});

		it('should show the request as pending', function () {
			browser.wait(preferencesPage.pendingConnections.isDisplayed, 10000);
			expect(preferencesPage.pendingConnections.getText()).toContain(browser.params.userName);
		});

		it('should approve the request', function () {
			preferencesPage.approveConnectionButton.click();
			browser.wait(preferencesPage.modalOverlay.isDisplayed, 10000);
			expect(preferencesPage.approveConnectionModalText.isPresent()).toBeTruthy();
			preferencesPage.modalOverlay.click();
			expect(preferencesPage.noPendingConnectionsMessage.isPresent()).toBeTruthy();
		});

		it('should show in approved connections', function () {
			browser.wait(preferencesPage.approvedConnections.isDisplayed, 10000);
			expect(preferencesPage.approvedConnections.getText()).toContain(browser.params.userName);
		});

	});

	describe('Seeing the connection info after approval', function () {

		beforeAll(function () {
			navObject.logOut();
			loginPage.get();
	  	loginPage.login();
	  	navObject.searchInput.sendKeys(browser.params.adminUserName);
			browser.wait(navObject.searchAutocomplete.isDisplayed, 1000);
			var el = element(by.cssContainingText('.search-autocomplete__item a', browser.params.adminUserName));
			el.click();
			browser.wait(profilePage.adminUserName.isDisplayed(), 10000);
		});

		it('should show the phone number', function () {
			expect(profilePage.phoneNumbers.getText()).toContain(browser.params.adminUserPhoneNumber);
		});

	});

	describe('Removing connections', function () {

		beforeAll(function () {
			navObject.logOut();
			loginPage.get();
	  	loginPage.loginAdmin();
	  	navObject.openUserDropdown();
	  	navObject.preferencesLink.click();
	  	browser.wait(preferencesPage.pageHeading.isDisplayed, 10000);
		});

		it('should remove the connection', function () {
			browser.wait(preferencesPage.removeConnectionButton.isDisplayed, 10000);
			preferencesPage.removeConnectionButton.click();
			browser.wait(preferencesPage.modalOverlay.isDisplayed, 10000);
			expect(preferencesPage.removeConnectionModalText.isPresent()).toBeTruthy();
			preferencesPage.modalOverlay.click();
		});

	});

	afterAll(function () {
		browser.sleep(3000);
		navObject.logOut();
	});

});
