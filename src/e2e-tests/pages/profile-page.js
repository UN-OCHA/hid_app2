/* jshint module: true */
var ProfilePage = function() {
  this.userName = element(by.css('.page-header__heading'));
  this.userStatus = element(by.css('.profile-header__status'));
  this.editButton = element(by.css('.t-user-edit-btn'));
  this.closeEditButton = element(by.css('.t-close-edit-btn'));
  this.newEmailInput = element(by.id('new_email'));
  this.statusInput = element(by.id('user_status'));
  this.profileAlert = element(by.css('.profile-alert'));
};

module.exports = ProfilePage;
