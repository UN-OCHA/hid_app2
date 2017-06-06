/* jshint module: true */
var CheckinPage = function() {
	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Check-in'));
	this.selectList = element(by.css('.t-select-list'));
	this.selectListToggle = this.selectList.element(by.css('.ui-select-toggle'));
	this.selectListInput = element(by.css('.t-select-list input[type="search"]'));
	this.selectListResults = element(by.css('.t-select-list .ui-select-choices'));
	this.selectListResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', browser.params.standardTestList)).first();
	this.selectedLists = element(by.repeater('list in selectedLists'));
	this.checkinButton = element(by.css('.t-checkin-btn'));
	this.checkinModal = element(by.css('.modal-success'));
	this.checkinModalText = element(by.cssContainingText('div .modal-body', 'You were successfully checked in.'));
};

module.exports = CheckinPage;
