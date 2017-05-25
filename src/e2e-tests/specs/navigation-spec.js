/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');

describe('Navigation', function () {
	var loginPage = new LoginPage();
	var navObject = new NavObject();

  beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	});

	describe('Using the navigation', function () {

		it('should navigate to the dashboard', function () {
			navObject.dashboardLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'dashboard');
		});

		it('should navigate to the landing page', function () {
			navObject.landingLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'landing');
		});

		it('should navigate to the humanitarian contacts page', function () {
			navObject.humanitarianContactsLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'search');
		});

		it('should navigate to the check in page', function () {
			navObject.checkinLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'checkin/' + browser.params.userId);
		});

		it('should navigate to the check out page', function () {
			navObject.checkoutLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'checkout');
		});

		it('should navigate to the notifications page', function () {
			navObject.notificationsLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'notifications');
		});

		it('should navigate to my profile page', function () {
			navObject.openUserDropdown();
			navObject.profileLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'users/' + browser.params.userId);
		});

		it('should navigate to my preferences page', function () {
			navObject.openUserDropdown();
			navObject.preferencesLink.click();
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'settings');
		});

	});

	afterAll(function () {
		navObject.logOut();
	});

});
