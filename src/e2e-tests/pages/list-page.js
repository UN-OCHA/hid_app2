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

  this.filtersButton = element(by.css('.t-list-filters-btn'));
  this.filtersSidebar = element(by.css('.t-user-filters'));
  this.nameFilterInput = element(by.css('.t-filter-name'));
  this.applyFiltersButton = element(by.css('.t-apply-filters'));
  this.clearFiltersButton = element(by.css('.t-clear-filters'));
  this.closeFiltersButton = element(by.css('.t-close-user-filters'));
  this.currentFilters = element.all(by.css('.t-current-user-filters .tag-list__item')).get(0);
  this.locationFiltersButton = element(by.css('.t-toggle-location-filters'));
  this.occupationFiltersButton = element(by.css('.t-toggle-occupation-filters'));

  this.countryFilter = element(by.css('.t-country-filter'));
  this.countryFilterToggle = element(by.css('.t-country-filter .ui-select-toggle'));
  this.countryFilterInput = element(by.css('.t-country-filter .ui-select-search'));
  this.countryFilterOption = element(by.cssContainingText('.t-country-filter .ui-select-choices-row-inner', 'United Kingdom'));

  this.selectDisaster = element(by.css('.t-disaster-filter'));
  this.selectDisasterToggle = this.selectDisaster.element(by.css('.ui-select-toggle'));
  this.selectDisasterInput = this.selectDisaster.element(by.css('input[type="search"]'));
  this.selectDisasterResults = this.selectDisaster.element(by.css('.ui-select-choices'));

  this.selectOffice = element(by.css('.t-office-filter'));
  this.selectOfficeToggle = this.selectOffice.element(by.css('.ui-select-toggle'));
  this.selectOfficeInput = this.selectOffice.element(by.css('input[type="search"]'));
  this.selectOfficeResults = this.selectOffice.element(by.css('.ui-select-choices'));

  this.selectOperation = element(by.css('.t-operation-filter'));
  this.selectOperationToggle = this.selectOperation.element(by.css('.ui-select-toggle'));
  this.selectOperationInput = this.selectOperation.element(by.css('input[type="search"]'));
  this.selectOperationResults = this.selectOperation.element(by.css('.ui-select-choices'));

  this.selectGroup = element(by.css('.t-group-filter'));
  this.selectGroupToggle = this.selectGroup.element(by.css('.ui-select-toggle'));
  this.selectGroupInput = this.selectGroup.element(by.css('input[type="search"]'));
  this.selectGroupResults = this.selectGroup.element(by.css('.ui-select-choices'));

  this.selectRole = element(by.css('.t-role-filter'));
  this.selectRoleToggle = this.selectRole.element(by.css('.ui-select-toggle'));
  this.selectRoleInput = this.selectRole.element(by.css('input[type="search"]'));
  this.selectRoleResults = this.selectRole.element(by.css('.ui-select-choices'));

  this.selectType = element(by.css('.t-type-filter'));
  this.selectTypeToggle = this.selectType.element(by.css('.ui-select-toggle'));
  this.selectTypeInput = this.selectType.element(by.css('input[type="search"]'));
  this.selectTypeResults = this.selectType.element(by.css('.ui-select-choices'));

  this.lockedListMessage = element(by.css('.t-locked-list-msg'));
  this.usersTable = element(by.css('.t-users-table'));

  this.openLocationFilters = function () {
    this.openListFilters();
    browser.wait(this.locationFiltersButton.isDisplayed(), 10000);
    this.locationFiltersButton.click();
    browser.wait(this.selectCountryToggle.isDisplayed(), 10000);
  };

  this.openOccupationFilters = function () {
    this.openListFilters();
    browser.wait(this.occupationFiltersButton.isDisplayed(), 10000);
    this.occupationFiltersButton.click();
    browser.wait(this.selectGroupToggle.isDisplayed(), 10000);
  };

  this.filterByDisaster = function (disaster) {
    this.selectDisasterToggle.click();
    browser.wait(this.selectDisasterInput.isDisplayed(), 10000);
    this.selectDisasterInput.sendKeys(disaster);
    browser.wait(this.selectDisasterResults.isDisplayed(), 10000);
    var selectDisasterResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', disaster)).first();
    browser.wait(selectDisasterResult.isDisplayed(), 10000);
    selectDisasterResult.click();
    this.applyFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.filterByOffice = function (office) {
    this.selectOfficeToggle.click();
    browser.wait(this.selectOfficeInput.isDisplayed(), 10000);
    this.selectOfficeInput.sendKeys(office);
    browser.wait(this.selectOfficeResults.isDisplayed(), 10000);
    var selectOfficeResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', office)).first();
    browser.wait(selectOfficeResult.isDisplayed(), 10000);
    selectOfficeResult.click();
    this.applyFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.filterByOperation = function (operation) {
    this.selectOperationToggle.click();
    browser.wait(this.selectOperationInput.isDisplayed(), 10000);
    this.selectOperationInput.sendKeys(operation);
    browser.wait(this.selectOperationResults.isDisplayed(), 10000);
    var selectOperationResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', operation)).first();
    browser.wait(selectOperationResult.isDisplayed(), 10000);
    selectOperationResult.click();
    this.applyFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.filterByGroup = function (group) {
    this.selectGroupToggle.click();
    browser.wait(this.selectGroupInput.isDisplayed(), 10000);
    this.selectGroupInput.sendKeys(group);
    browser.wait(this.selectGroupResults.isDisplayed(), 10000);
    var selectGroupResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', group)).first();
    browser.wait(selectGroupResult.isDisplayed(), 10000);
    selectGroupResult.click();
    this.applyFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.filterByRole = function (role) {
    this.selectRoleToggle.click();
    browser.wait(this.selectRoleInput.isDisplayed(), 10000);
    this.selectRoleInput.sendKeys(role);
    browser.wait(this.selectRoleResults.isDisplayed(), 10000);
    var selectRoleResult = element.all(by.cssContainingText('a.ui-select-choices-row-inner', role)).first();
    browser.wait(selectRoleResult.isDisplayed(), 10000);
    selectRoleResult.click();
    this.applyFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.goToList = function (listName) {
    navObject.searchInput.sendKeys(listName);
    var el = element(by.cssContainingText('.search-autocomplete__item a', listName));
    el.click();
    browser.wait(element(by.cssContainingText('.page-header__heading', listName)), 10000);
  };

  this.openListFilters = function () {
    browser.wait(this.filtersButton.isDisplayed(), 10000);
    this.filtersButton.click();
    browser.wait(this.filtersSidebar.isDisplayed(), 10000);
  };

  this.clearFilters = function () {
    this.openListFilters();
    browser.sleep(500);
    this.clearFiltersButton.click();
    browser.sleep(500);
    this.closeFiltersButton.click();
    browser.wait(this.listTitle.isDisplayed(), 10000);
  };

  this.openListAdmin = function () {
    browser.wait(this.adminButton.isDisplayed(), 10000);
    this.adminButton.click();
    browser.wait(this.adminSidebar.isDisplayed(), 10000);
  };

  this.deleteList = function () {
    browser.wait(this.adminButton.isDisplayed(), 10000);
    this.adminButton.click();
    browser.wait(this.adminSidebar.isDisplayed(), 10000);
    this.deleteButton.click();

    browser.wait(this.confirmModal.isDisplayed(), 10000);
    this.confirmModalButton.click();
    browser.wait(this.deleteSuccessModalText.isDisplayed(), 10000);
  };

};

module.exports = ListPage;
