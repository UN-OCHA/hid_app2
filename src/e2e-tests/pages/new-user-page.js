/* jshint module: true */
var NewUserPage = function() {
	var emailInput = element(by.id('email'));
	var firstNameInput = element(by.id('given_name'));
	var lastNameInput = element(by.id('family_name'));
	var saveButton = element(by.css('.t-save-user-btn'));
	var successMessage = 'The user was successfully created. If you inserted an email address, they will receive an email to claim their account. You can now edit the user profile to add more information.';

	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Create a new list'));
	this.modalOverlay = element(by.css('.modal'));
  this.successModalText = element(by.cssContainingText('div .modal-body', successMessage));

 	this.populateNewUserForm = function () {
 		emailInput.sendKeys(browser.params.tempUserEmail);
 		firstNameInput.sendKeys(browser.params.tempUserFirstName);
 		lastNameInput.sendKeys(browser.params.tempUserLastName);
 		saveButton.click();
 	};

};

module.exports = NewUserPage;
