/* jshint module: true */
var SearchResultsPage = function() {
	this.showListsButton = element(by.css('.t-show-lists'));
	this.allLists = element(by.css('.t-all-lists'));
	this.currentListFilters = element(by.css('.t-list-current-filters'));
	this.users = element.all(by.repeater('user in users').column('user.name'));
	this.lists = element(by.repeater('list in lists').column('list.name'));
};

module.exports = SearchResultsPage;
