/* jshint module: true */
var DashboardPage = function() {
  this.createListButton = element(by.css('.t-new-list-btn'));
  this.favouritesTabBtn = element.all(by.css('.tabs-nav__button')).first();
  this.favourites = element.all(by.repeater('list in userLists.favoriteLists').column('list.name'));
};

module.exports = DashboardPage;
