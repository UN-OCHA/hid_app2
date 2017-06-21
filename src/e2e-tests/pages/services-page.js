/* jshint module: true */
var ServicesPage = function() {

	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Services'));
	this.addServiceButton = element(by.css('.t-add-service-btn'));

	this.services = element.all(by.repeater('service in services').column('service.name'));
	this.newMailChimpServiceLink = element(by.cssContainingText('td a', browser.params.tempMailChimpService));
	this.newGoogleServiceLink = element(by.cssContainingText('td a', browser.params.tempGoogleService));

	this.serviceAdminButton = element(by.css('.t-service-admin-btn'));
	this.serviceAdmin = element(by.css('.t-service-admin'));
	this.deleteServiceButton = element(by.css('.t-delete-service-btn'));

	this.modalOverlay = element(by.css('.modal'));
  this.confirmModalText = element(by.cssContainingText('div .modal-body', 'Are you sure?'));
  this.confirmModalButton = element(by.css('.t-confirm-btn'));
  this.successModalText = element(by.cssContainingText('div .modal-body', 'Service deleted successfully'));

};

module.exports = ServicesPage;




