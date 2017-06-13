/* jshint module: true */
var DashboardPage = function() {
	this.pageHeading = element(by.cssContainingText('.page-header__heading', 'Dashboard'));
  this.createListButton = element(by.css('.t-new-list-btn'));
  this.favouritesTabBtn = element.all(by.css('.tabs-nav__button')).first();
  this.favourites = element.all(by.repeater('list in userLists.favoriteLists').column('list.name'));
  this.listsMember = element.all(by.repeater('list in userLists.listsMember').column('list.name'));
  this.listMemberLink = element(by.cssContainingText('.list__item a', browser.params.standardTestList));
  this.listsManage = element.all(by.repeater('list in userLists.listsOwnedAndManaged').column('list.name'));
  this.listsManageTabBtn = element.all(by.cssContainingText('.tabs-nav__button', 'Lists I manage')).first();
  this.newUserButton = element(by.css('.t-new-user-btn'));
};

module.exports = DashboardPage;
