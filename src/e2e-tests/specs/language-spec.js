/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');

describe('Language switcher', function () {
	var loginPage = new LoginPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	});

	it('should change the language to French', function () {
		navObject.openLanguageDropdown();
		navObject.langFR.click();
		expect(element(by.css('.page-header__heading')).getText()).toContain('Bienvenue sur Humanitarian ID');
	});

	it('should change the language back to English', function () {
		navObject.openLanguageDropdown();
		navObject.langEN.click();
		expect(element(by.css('.page-header__heading')).getText()).toContain('Welcome to Humanitarian ID');
	});

	afterAll(function () {
		navObject.logOut();
	});

});
