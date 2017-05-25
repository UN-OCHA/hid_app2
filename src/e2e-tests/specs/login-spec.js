/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');

describe('Login', function () {
	var loginPage = new LoginPage();
	var navObject = new NavObject();

  describe('Unsuccessful login', function () {

		it('should show an error message', function () {
			loginPage.get();
	    loginPage.badLogin();

	    browser.wait(loginPage.errorModal.isDisplayed(), 1000);

			expect(browser.getCurrentUrl()).toBe(browser.baseUrl);
			expect(loginPage.errorModal.isPresent()).toBeTruthy();
			expect(loginPage.errorModalText.isPresent()).toBeTruthy();
		});

	});

	describe('Successful login', function () {

		it('should go to the landing page', function () {
			loginPage.get();
	    loginPage.login();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'landing');
		});

	});

	afterAll(function () {
		navObject.logOut();
	});

});
