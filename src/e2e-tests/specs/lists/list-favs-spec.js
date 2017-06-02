/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var NavObject = require('../../pages/nav-object');
var DashboardPage = require('../../pages/dashboard-page');
var ListPage = require('../../pages/list-page');

describe('Favourite Lists', function () {
	var loginPage = new LoginPage();
	var dashboardPage = new DashboardPage();
	var listPage = new ListPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	});

	describe('Favouriting and unfavouriting a list', function () {

		beforeAll(function () {
			listPage.goToList(browser.params.standardTestList);
		});

		describe('Favouriting', function () {

			beforeAll(function () {
				listPage.openListAdmin();
				listPage.favButton.click();
			});

			it('should show the success modal when favourite it', function () {
				browser.wait(listPage.favSuccessModal.isDisplayed(), 10000);
				expect(listPage.favSuccessModalText.isPresent()).toBeTruthy();
			});

			it('should show in my favourite lists on the dashboard', function () {
				listPage.modalOverlay.click();
				browser.wait(navObject.dashboardLink.isDisplayed(), 10000);
				navObject.dashboardLink.click();
				dashboardPage.favouritesTabBtn.click();
				expect(dashboardPage.favourites.getText()).toContain(browser.params.standardTestList);
			});
		});

		describe('Unfavouriting', function () {

			beforeAll(function () {
				listPage.goToList(browser.params.standardTestList);
				listPage.openListAdmin();
				listPage.unFavButton.click();
			});

			it('should show the success modal when unfavourite it', function () {
				browser.wait(listPage.favSuccessModal.isDisplayed(), 10000);
				expect(listPage.unFavSuccessModalText.isPresent()).toBeTruthy();
			});

			it('should not show in my favourite lists on the dashboard', function () {
				listPage.modalOverlay.click();
				browser.wait(navObject.dashboardLink.isDisplayed(), 10000);
				navObject.dashboardLink.click();
				dashboardPage.favouritesTabBtn.click();
				expect(dashboardPage.favourites.getText()).not.toContain(browser.params.standardTestList);
			});

		});

	});

	afterAll(function () {
		browser.sleep(3000); //wait for modals to close
		navObject.logOut();
	});

});
