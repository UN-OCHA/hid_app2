/* jshint module: true */
var NewServicePage = function() {
	var nameInput = element(by.id('name'));
	var mailChimpCheckbox = element(by.css('.t-type-mailchimp'));
	var mailChimpInput = element(by.id('mailchimp-api-key'));
	var mailChimpSelect = element(by.css('.t-mailchimp-select'));
	var saveButton = element(by.css('.t-save-service-btn'));

	var googleCheckbox = element(by.css('.t-type-googlegroup'));
	var googleDomainSelect = element(by.css('.t-gg-domain'));
	var googleGroupSelect = element(by.css('.t-gg'));

	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Create a new service'));
	this.modalOverlay = element(by.css('.modal'));
  this.successModalText = element(by.cssContainingText('div .modal-body', 'Service saved successfully'));

 	this.populateNewServiceForm = function () {
 		nameInput.sendKeys(browser.params.tempMailChimpService);
 		mailChimpCheckbox.click();
 		browser.wait(mailChimpInput.isDisplayed, 10000);
 		mailChimpInput.sendKeys(browser.params.mailChimpApiKey);
 		browser.wait(mailChimpSelect.isDisplayed, 10000);
 		mailChimpSelect.click();
 		element(by.cssContainingText('option', 'HID Test')).click();
 		saveButton.click();
 	};

 	this.populateNewGoogleServiceForm = function () {
 		nameInput.sendKeys(browser.params.tempGoogleService);
 		googleCheckbox.click();
 		browser.wait(googleDomainSelect.isDisplayed, 10000);
 		googleDomainSelect.click();
 		element(by.cssContainingText('option', 'humanitarian.id')).click();
 		browser.wait(googleGroupSelect.isDisplayed, 10000);
 		googleGroupSelect.click();
 		element(by.cssContainingText('option', 'HID Test')).click();
 		saveButton.click();
 	};

};

module.exports = NewServicePage;
