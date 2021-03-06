/* jshint module: true */
var NavObject = require('../pages/nav-object');
var DashboardPage = require('../pages/dashboard-page');

var NewListPage = function() {
  var navObject = new NavObject();
  var dashboardPage = new DashboardPage();

  var nameInput = element(by.id('name'));
  var visibilityAllCheckbox = element(by.css('.t-visibility-all'));
  var joinabilityPublicCheckbox = element(by.css('.t-joinability-public'));
  var saveButton = element(by.css('.t-save-list-btn'));

  this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Create a new list'));

  this.populateNewListForm = function (name) {
    var listName = name || browser.params.tempList;
    nameInput.sendKeys(listName);
    visibilityAllCheckbox.click();
    joinabilityPublicCheckbox.click();
    saveButton.click();
    browser.sleep(500);
  };

  this.createList = function (name) {
    navObject.dashboardLink.click();
    dashboardPage.createListButton.click();
    this.populateNewListForm(name);
  };

};

module.exports = NewListPage;
