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

 	this.populateNewListForm = function (name) {
 		var listName = name || 'Test E2E user list';
 		nameInput.sendKeys(listName);
 		visibilityAllCheckbox.click();
 		joinabilityPublicCheckbox.click();
 		saveButton.click();
 	};

 	this.createList = function (name) {
		navObject.dashboardLink.click();
	  dashboardPage.createListButton.click();
	  this.populateNewListForm(name);
	};

};

module.exports = NewListPage;
