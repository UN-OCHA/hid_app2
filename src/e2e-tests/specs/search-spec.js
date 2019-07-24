/* jshint module: true */
var LoginPage = require('../pages/login-page');
var NavObject = require('../pages/nav-object');
var SearchResultsPage = require('../pages/search-results-page');

describe('Search', function () {
	var loginPage = new LoginPage();
	var navObject = new NavObject();
	var searchResultsPage = new SearchResultsPage();
	var listSearchText = 'climb for haiti';
	var listSearchResult = 'CLIMB for Haiti (CLIMB)';

  beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	});

	describe('Searching for a user', function () {

		describe('using the autocomplete', function () {

			beforeAll(function () {
				navObject.searchInput.sendKeys(browser.params.userName);
				browser.wait(navObject.searchAutocomplete.isDisplayed(), 1000);
			});

			it('should show the autocomplete', function () {
				expect(navObject.searchAutocomplete.isPresent()).toBeTruthy();
			});

			it('should have the searched for user in the autocomplete', function () {
				var results = element.all(by.repeater('result in searchPeople').column('result.name'));
				expect(results.getText()).toContain(browser.params.userName);
			});

			it('should go to the searched for user profile when clicked', function () {
				// var result = element(by.repeater('result in searchPeople').row(0));
				var result = element.all(by.cssContainingText('.search-autocomplete__item a', browser.params.userName)).first();
				result.click();
				// browser.waitForAngular();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'users/' + browser.params.userId);
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});

		});

		describe('submitting the search form', function () {

			beforeAll(function () {
				navObject.searchInput.sendKeys(browser.params.userName);
				browser.actions().sendKeys(protractor.Key.ENTER).perform();
			});

			it('should go to the search results when submit the search form', function () {
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'search?q=' + encodeURIComponent(browser.params.userName));
			});

			it('should show the search term in the current filters', function () {
				var filter = element(by.repeater('filter in currentFilters.all'));
				expect(filter.getText()).toContain(browser.params.userName);
			});

			it('should show the show the searched for user in the results', function () {
				browser.wait(searchResultsPage.users.isDisplayed(), 10000);
				expect(searchResultsPage.users.getText()).toContain(browser.params.userName);
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});

		});

		describe('clicking see all in the autocomplete', function () {
			beforeAll(function () {
				navObject.searchInput.sendKeys(browser.params.userName);
				navObject.searchSeeAllUsers.click();
			});

			it('should go to the search results when click see all', function () {
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'search?q=' + encodeURIComponent(browser.params.userName));
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});
		});

	});

	describe('Searching for a list', function () {

		describe('using the autocomplete', function () {

			beforeAll(function () {
				navObject.searchInput.sendKeys(listSearchText);
				browser.wait(navObject.searchAutocomplete.isDisplayed(), 1000);
			});

			it('should show the autocomplete', function () {
				expect(navObject.searchAutocomplete.isPresent()).toBeTruthy();
			});

			it('should have the searched for list in the autocomplete', function () {
				var results = element.all(by.repeater('result in searchLists').column('result.name'));
				expect(results.getText()).toContain(listSearchResult);
			});

			it('should go to the searched for list when clicked', function () {
				var result = element.all(by.cssContainingText('.search-autocomplete__item a', listSearchResult)).first();
				result.click();
				// browser.waitForAngular();
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'lists/58b44a703d0ba000db414766');
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});

		});

		describe('submitting the search form', function () {

			beforeAll(function () {
				navObject.searchInput.sendKeys(listSearchText);
				browser.actions().sendKeys(protractor.Key.ENTER).perform();
			});

			it('should go to the search results when submit the search form', function () {
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'search?q=' + encodeURIComponent(listSearchText));
			});

			it('should show list results when click show lists', function () {
				searchResultsPage.showListsButton.click();
				expect(searchResultsPage.allLists.isDisplayed()).toBeTruthy();
			});

			it('should show the search term in the current filters', function () {
				expect(searchResultsPage.currentListFilters.getText()).toContain(listSearchText);
			});

			it('should show the show the searched for list in the results', function () {
				browser.wait(searchResultsPage.lists.isDisplayed(), 10000);
				expect(searchResultsPage.lists.getText()).toContain(listSearchResult);
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});

		});

		describe('clicking see all in the autocomplete', function () {

			beforeAll(function () {
				navObject.searchInput.sendKeys(listSearchText);
				navObject.searchSeeAllLists.click();
			});

			it('should go to the search results with the lists tab open when click see all', function () {
				expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'search?q=' + encodeURIComponent(listSearchText) + '&view=lists');
				expect(searchResultsPage.allLists.isDisplayed()).toBeTruthy();
			});

			afterAll(function () {
				navObject.searchInput.clear();
			});
		});

	});

	afterAll(function () {
		navObject.logOut();
	});

});
