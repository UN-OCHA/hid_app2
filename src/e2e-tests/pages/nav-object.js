/* jshint module: true */
var NavObject = function() {
  this.landingLink = element(by.css('.t-logo-link'));
  this.dashboardLink = element(by.css('.t-dashboard-link'));
  this.humanitarianContactsLink = element(by.css('.t-hc-link'));
  this.checkinLink = element(by.css('.t-checkin-link'));
  this.checkoutLink = element(by.css('.t-checkout-link'));
  this.notificationsLink = element(by.css('.t-notifications-link'));
  this.profileLink = element(by.css('.t-profile-link'));
  this.preferencesLink = element(by.css('.t-preferences-link'));
  this.logoutLink = element(by.css('.t-logout-link'));
  this.logoutModalButton = element(by.css('.modal-footer .btn-primary'));
  this.searchInput = element(by.id('main-search'));
  this.searchAutocomplete = element(by.css('.search-autocomplete'));
  this.searchSeeAllUsers = element(by.css('.t-see-all-users'));
  this.searchSeeAllLists = element(by.css('.t-see-all-lists'));
  this.languageButton = element(by.css('.t-lang-btn'));
  this.langEN = element(by.css('.t-lang-en'));
  this.langFR = element(by.css('.t-lang-fr'));

  this.openUserDropdown = function () {
    element(by.css('.t-user-dropdown-btn')).click();
  };

  this.openLanguageDropdown = function () {
    this.languageButton.click();
  };

  this.logOut = function () {
    this.openUserDropdown();
    this.logoutLink.click();
    browser.sleep(500);
    this.logoutModalButton.click();
  };
};

module.exports = NavObject;
