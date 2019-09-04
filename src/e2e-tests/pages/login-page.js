/* jshint module: true */
var LoginPage = function() {
  var emailInput = element(by.id('email'));
  var passwordInput = element(by.id('password'));
  var loginButton = element(by.css('.t-login-btn'));

  this.get = function () {
    browser.get(browser.baseUrl);
  };

  this.login = function () {
    emailInput.sendKeys(browser.params.email);
    passwordInput.sendKeys(browser.params.password);
    loginButton.click();
  };

  this.loginAdmin = function () {
    emailInput.sendKeys(browser.params.adminEmail);
    passwordInput.sendKeys(browser.params.adminPassword);
    loginButton.click();
  };

  this.loginInvalid = function () {
    emailInput.sendKeys('testuser@example.com');
    passwordInput.sendKeys('notthepassword');
    loginButton.click();
  };

  this.errorModal = element(by.css('.modal-dialog'));
  this.errorModalText = element(by.cssContainingText('div .modal-body', 'We could not log you in. The username or password you have entered are incorrect. Kindly try again.'));
};

module.exports = LoginPage;
