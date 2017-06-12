/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');
var CheckinPage = require('../pages/checkin-page');
var CheckoutPage = require('../pages/checkout-page');
var DashboardPage = require('../pages/dashboard-page');
var ListPage = require('../pages/list-page');

describe('Check in and out of a list', function () {
	var loginPage = new LoginPage();
	var checkinPage = new CheckinPage();
	var checkoutPage = new CheckoutPage();
	var navObject = new NavObject();
	var dashboardPage = new DashboardPage();
	var listPage = new ListPage();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	  navObject.checkinLink.click();
	});

	describe('Checking in to a list', function () {

		it('should find the list', function () {
			browser.wait(checkinPage.pageHeading.isDisplayed(), 10000);
			checkinPage.selectListToggle.click();
			browser.wait(checkinPage.selectListInput.isDisplayed(), 10000);
			checkinPage.selectListInput.sendKeys(browser.params.standardTestList);
			browser.wait(checkinPage.selectListResults.isDisplayed(), 10000);
			expect(checkinPage.selectListResults.getText()).toContain(browser.params.standardTestList);
		});

		it('should select the list', function () {
			checkinPage.selectListResult.click();
			expect(checkinPage.selectedLists.getText()).toContain(browser.params.standardTestList);
		});

		it('should check in to the list', function () {
			checkinPage.checkinButton.click();
			browser.wait(checkinPage.checkinModal.isDisplayed(), 15000);
			expect(checkinPage.checkinModalText.isPresent()).toBeTruthy();
		});

	});

	describe('Viewing lists I\'m a member of on the dashboard', function () {

		it('should show the list in Lists I\'m part of', function () {
			checkoutPage.modalOverlay.click();
			browser.wait(dashboardPage.pageHeading.isDisplayed(), 10000);
			expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'dashboard');
			expect(dashboardPage.listsMember.getText()).toContain(browser.params.standardTestList);
		});

	});

	describe('Viewing the list', function () {

		beforeAll(function () {
			dashboardPage.listMemberLink.click();
		});

		it('should show me in the list', function () {
			browser.wait(listPage.listUsers.isDisplayed(), 10000);
			expect(listPage.listUsers.getText()).toContain(browser.params.userName);
		});

	});

	describe('Checking out of a list', function () {
		beforeAll(function () {
			navObject.checkoutLink.click();
			browser.wait(checkoutPage.pageHeading.isDisplayed(), 10000);
		});

		describe('On the Check out page', function () {

			it('should show the list', function () {
				expect(checkoutPage.lists.getText()).toContain(browser.params.standardTestList);
			});

			describe('Checking out of the list', function () {

				it('should ask to confirm check out of the list', function () {
					checkoutPage.checkoutButton.click();
					browser.wait(checkoutPage.confirmModal.isDisplayed(), 5000);
					expect(checkoutPage.confirmModalText.isPresent()).toBeTruthy();
				});

				it('should show the success message', function () {
					checkoutPage.confirmModalButton.click();
					browser.wait(checkoutPage.successModal.isDisplayed(), 5000);
					expect(checkoutPage.successModalText.isPresent()).toBeTruthy();
					checkoutPage.modalOverlay.click();
				});

				it('should not show the list', function () {
					expect(checkoutPage.lists.getText()).not.toContain(browser.params.standardTestList);
				});

			});

		});

	});

	afterAll(function () {
		browser.sleep(3000); //wait for modals to close
		navObject.logOut();
	});

});
