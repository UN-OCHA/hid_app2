/* jshint module: true */
var NavObject = function() {
  this.openUserDropdown = function () {
    element(by.css('.t-user-dropdown-btn')).click();
  };

  this.openLanguageDropdown = function () {
    element(by.css('.t-lang-dropdown-btn')).click();
  };

  this.landingLink = element(by.css('.site-header__logo'));
  this.dashboardLink = element(by.css('.t-dashboard-link'));
  this.humanitarianContactsLink = element(by.css('.t-hc-link'));
  this.checkinLink = element(by.css('.t-checkin-link'));
  this.checkoutLink = element(by.css('.t-checkout-link'));
  this.notificationsLink = element(by.css('.t-notifications-link'));
  this.profileLink = element(by.css('.t-profile-link'));
  this.preferencesLink = element(by.css('.t-preferences-link'));
  this.logoutLink = element(by.css('.t-logout-link'));
  this.searchInput = element(by.id('main-search'));
  this.searchAutocomplete = element(by.css('.search-autocomplete'));
  this.searchSeeAllUsers = element(by.css('.t-see-all-users'));
  this.searchSeeAllLists = element(by.css('.t-see-all-lists'));
  this.langEN = element(by.css('.t-lang-en'));
  this.langFR = element(by.css('.t-lang-fr'));

  this.logOut = function () {
    this.openUserDropdown();
    this.logoutLink.click();
    browser.sleep(3000);
  };
};

module.exports = NavObject;
