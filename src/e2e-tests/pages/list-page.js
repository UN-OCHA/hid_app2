/* jshint module: true */
var NavObject = require('../pages/nav-object');

var ListPage = function() {
	var navObject = new NavObject();

	this.confirmModal = element(by.css('.modal-dialog'));
	this.confirmModalText = element(by.cssContainingText('div .modal-body', 'Are you sure?'));
	this.confirmModalButton = element(by.css('.t-confirm-btn'));
	this.successModal = element(by.css('.modal-success'));
	this.modalOverlay = element(by.css('.modal'));

	this.listTitle = element(by.css('.page-header__heading'));
	this.listActions = element(by.css('.list-actions'));
	this.adminButton = element(by.css('.t-list-admin-btn'));
	this.adminSidebar = element(by.css('.t-list-admin'));
	this.favButton = element(by.css('.t-fav-btn'));
	this.unFavButton = element(by.css('.t-unfav-btn'));
	this.deleteButton = element(by.css('.t-delete-list-btn'));


	this.deleteSuccessModal = element(by.css('.modal-success'));
	this.deleteSuccessModalText = element(by.cssContainingText('div .modal-body', 'The list was successfully deleted.'));
	this.favSuccessModal = element(by.css('.modal-success'));
	this.favSuccessModalText = element(by.cssContainingText('div .modal-body', 'This list was successfully added to your favourites.'));
	this.unFavSuccessModalText = element(by.cssContainingText('div .modal-body', 'This list was successfully removed from your favourites.'));

	this.addMemberInput = element(by.css('.t-add-member input[type="search"]'));
	this.addMemberResult = element(by.cssContainingText('.ui-select-choices-row-inner', browser.params.adminUserName));
	this.addMemberButton = element(by.css('.t-add-member-btn'));

	this.addMemberSuccessModalText = element(by.cssContainingText('div .modal-body', 'Successfully added to list'));

	this.listUsers = element.all(by.repeater('user in users').column('user.name'));
	this.userOptionsButton = element.all(by.css('.t-user-options-btn')).get(0);
	this.removeFromListButton = element(by.css('.t-remove-from-list-btn'));

	this.removeSuccessModalText = element(by.cssContainingText('div .modal-body', 'The user was successfully checked out.'));

	this.goToList = function (listName) {
		navObject.searchInput.sendKeys(listName);
		var el = element(by.cssContainingText('.search-autocomplete__item a', listName));
		el.click();
		browser.wait(this.adminButton.isDisplayed(), 5000);
	};

	this.openListAdmin = function () {
		browser.wait(this.adminButton.isDisplayed(), 5000);
		this.adminButton.click();
		browser.wait(this.adminSidebar.isDisplayed(), 5000);
	};

	this.deleteList = function () {
		browser.wait(this.adminButton.isDisplayed(), 5000);
		this.adminButton.click();
		browser.wait(this.adminSidebar.isDisplayed(), 5000);
		this.deleteButton.click();

		browser.wait(this.confirmModal.isDisplayed(), 5000);
		this.confirmModalButton.click();
		browser.wait(this.deleteSuccessModalText.isDisplayed(), 5000);
	};

};

module.exports = ListPage;
