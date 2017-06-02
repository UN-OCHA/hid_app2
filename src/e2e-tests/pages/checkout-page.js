/* jshint module: true */
var CheckoutPage = function() {
	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Check out'));
	this.lists = element.all(by.css('.t-list a'));
	this.listToCheckoutOf = element(by.cssContainingText('.t-list', browser.params.standardTestList));
	this.checkoutButton = this.listToCheckoutOf.element(by.css('.t-checkout-btn'));
	this.modalOverlay = element(by.css('.modal'));
	this.confirmModal = element(by.css('.modal-dialog'));
	this.confirmModalText = element(by.cssContainingText('div .modal-body', 'Are you sure?'));
	this.confirmModalButton = element(by.css('.t-confirm-btn'));
	this.successModal = element(by.css('.modal-success'));
	this.successModalText = element(by.cssContainingText('div .modal-body', 'Successfully removed from list'));
};

module.exports = CheckoutPage;
