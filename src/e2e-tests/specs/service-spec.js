/* jshint module: true */
var DashboardPage = require('../pages/dashboard-page');
var LoginPage = require('../pages/login-page');
var ServicesPage = require('../pages/services-page');
var NewServicePage = require('../pages/new-service-page');
var NavObject = require('../pages/nav-object');

describe('Create new service as an admin', function () {
	var dashboardPage = new DashboardPage();
	var loginPage = new LoginPage();
	var servicesPage = new ServicesPage();
	var newServicePage = new NewServicePage();
	var navObject = new NavObject();

	describe('MailChimp services', function () {

		beforeAll(function () {
			loginPage.get();
		  loginPage.loginAdmin();
		  navObject.dashboardLink.click();
		  browser.wait(dashboardPage.pageHeading.isDisplayed, 10000);
		});

		describe('Creating a new MailChimp service', function () {

			it('should go to the services page', function () {
				dashboardPage.manageServicesButton.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
				browser.wait(servicesPage.pageHeading.isDisplayed, 10000);
				expect(servicesPage.pageHeading.isPresent()).toBeTruthy();
			});

			it('should go to the new service form', function () {
				servicesPage.addServiceButton.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services/new');
				browser.wait(newServicePage.pageHeading.isDisplayed, 10000);
				expect(newServicePage.pageHeading.isPresent()).toBeTruthy();
			});

			it('should save the new service', function () {
	 			newServicePage.populateNewServiceForm();
	 			browser.wait(newServicePage.modalOverlay.isDisplayed, 10000);
				expect(newServicePage.successModalText.isPresent()).toBeTruthy();
				newServicePage.modalOverlay.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
			});

			it('should show the new service in the services list', function () {
				browser.wait(servicesPage.services.isDisplayed, 10000);
				expect(servicesPage.services.getText()).toContain(browser.params.tempMailChimpService);
			});

			it('should be able to view the new service', function () {
				servicesPage.newMailChimpServiceLink.click();
				var heading = element(by.cssContainingText('.page-header__heading', browser.params.tempMailChimpService));
				browser.wait(heading.isDisplayed, 10000);
				expect(heading.isPresent()).toBeTruthy();
			});

		});

		describe('Deleting the service', function () {

			it('should open the admin sidebar', function () {
				servicesPage.serviceAdminButton.click();
				browser.wait(servicesPage.serviceAdmin.isDisplayed, 10000);
				expect(servicesPage.serviceAdmin.isDisplayed()).toBeTruthy();
			});

			it('should ask you to confirm when click the delete button', function () {
				servicesPage.deleteServiceButton.click();

				browser.wait(servicesPage.modalOverlay.isDisplayed, 10000);
				expect(servicesPage.confirmModalText.isPresent()).toBeTruthy();
			});

			it('should delete the service when click ok', function () {
				servicesPage.confirmModalButton.click();
				browser.wait(servicesPage.successModalText.isDisplayed, 10000);
				expect(servicesPage.successModalText.isPresent()).toBeTruthy();

				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
				browser.wait(servicesPage.services.isDisplayed, 10000);
				expect(servicesPage.services.getText()).not.toContain(browser.params.tempMailChimpService);

			});

		});

		afterAll(function () {
			browser.sleep(3000);
			navObject.logOut();
		});

	});

	describe('Google Group services', function () {

		beforeAll(function () {
			loginPage.get();
		  loginPage.loginAdmin();
		  navObject.dashboardLink.click();
		  browser.wait(dashboardPage.pageHeading.isDisplayed, 10000);
		});

		describe('Creating a new Google Group service', function () {

			it('should go to the services page', function () {
				dashboardPage.manageServicesButton.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
				browser.wait(servicesPage.pageHeading.isDisplayed, 10000);
				expect(servicesPage.pageHeading.isPresent()).toBeTruthy();
			});

			it('should go to the new service form', function () {
				servicesPage.addServiceButton.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services/new');
				browser.wait(newServicePage.pageHeading.isDisplayed, 10000);
				expect(newServicePage.pageHeading.isPresent()).toBeTruthy();
			});

			it('should save the new service', function () {
	 			newServicePage.populateNewGoogleServiceForm();
	 			browser.wait(newServicePage.modalOverlay.isDisplayed, 10000);
				expect(newServicePage.successModalText.isPresent()).toBeTruthy();
				newServicePage.modalOverlay.click();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
			});

			it('should show the new service in the services list', function () {
				browser.wait(servicesPage.services.isDisplayed, 10000);
				expect(servicesPage.services.getText()).toContain(browser.params.tempGoogleService);
			});

			it('should be able to view the new service', function () {
				servicesPage.newGoogleServiceLink.click();
				var heading = element(by.cssContainingText('.page-header__heading', browser.params.tempGoogleService));
				browser.wait(heading.isDisplayed, 10000);
				expect(heading.isPresent()).toBeTruthy();
			});

		});

		describe('Deleting the service', function () {

			it('should open the admin sidebar', function () {
				servicesPage.serviceAdminButton.click();
				browser.wait(servicesPage.serviceAdmin.isDisplayed, 10000);
				expect(servicesPage.serviceAdmin.isDisplayed()).toBeTruthy();
			});

			it('should ask you to confirm when click the delete button', function () {
				servicesPage.deleteServiceButton.click();

				browser.wait(servicesPage.modalOverlay.isDisplayed, 10000);
				expect(servicesPage.confirmModalText.isPresent()).toBeTruthy();
			});

			it('should delete the service when click ok', function () {
				servicesPage.confirmModalButton.click();
				browser.wait(servicesPage.successModalText.isDisplayed, 10000);
				expect(servicesPage.successModalText.isPresent()).toBeTruthy();

				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'services');
				browser.wait(servicesPage.services.isDisplayed, 10000);
				expect(servicesPage.services.getText()).not.toContain(browser.params.tempGoogleService);

			});

		});

		afterAll(function () {
			browser.sleep(3000);
			navObject.logOut();
		});

	});

});
