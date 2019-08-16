/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var NavObject = require('../../pages/nav-object');
var ListPage = require('../../pages/list-page');

describe('Filtering a List', function () {
  var loginPage = new LoginPage();
  var listPage = new ListPage();
  var navObject = new NavObject();

  beforeAll(function () {
    loginPage.get();
    loginPage.login();
    listPage.goToList('United Nations Office for the Coordination of Humanitarian Affairs');
  });

  describe('Filtering by name', function () {

    beforeAll(function () {
      listPage.openListFilters();
      browser.wait(listPage.nameFilterInput.isDisplayed(), 10000);
      listPage.nameFilterInput.sendKeys('Andrej');
      listPage.applyFiltersButton.click();
      browser.wait(listPage.listTitle.isDisplayed(), 10000);
    });

    it('should filter users by the name given', function () {
      expect(listPage.listUsers.getText()).toContain('Andrej Verity');
      expect(listPage.listUsers.getText()).not.toContain('Yaelle Link');
    });

    it('should update the current filters list', function () {
      expect(listPage.currentFilters.getText()).toContain('Andrej');
    });

    afterAll(function () {
      listPage.clearFilters();
    });

  });

  describe('Filtering by location', function () {

    it('should filter by country', function () {
      browser.sleep(3000);
      // open filters side bar
      browser.wait(listPage.filtersButton.isDisplayed, 5000);
      listPage.filtersButton.click();
      browser.wait(listPage.filtersSidebar.isDisplayed, 5000);

      // open locations filters
      listPage.locationFiltersButton.click();
      browser.wait(listPage.countryFilter.isDisplayed, 5000);

      // focus country filter
      listPage.countryFilterToggle.click();
      browser.wait(listPage.countryFilterInput.isDisplayed, 5000);

      // type in filter
      listPage.countryFilterInput.sendKeys('United Kingdom');

      // select option
      browser.wait(listPage.countryFilterOption.isDisplayed, 5000);
      expect(listPage.countryFilterOption.getText()).toContain('United Kingdom');
      listPage.countryFilterOption.click();

      // click apply button
      listPage.applyFiltersButton.click();

      expect(listPage.currentFilters.getText()).toContain('United Kingdom');
      expect(listPage.listUsers.getText()).not.toContain('Andrej Verity');
      expect(listPage.listUsers.getText()).toContain('Emma HOGBIN WESTBY');
    });

    it('should filter users by disaster', function () {
      browser.sleep(3000);
      listPage.openListFilters();
      listPage.filterByDisaster('Haiti: Earthquakes - Jan 2010');
      expect(listPage.currentFilters.getText()).toContain('Haiti: Earthquakes - Jan 2010');
    });

    it('should filter users by Coordination Hub', function () {
      browser.sleep(3000);
      listPage.openListFilters();
      listPage.filterByOffice('Haiti: Jeremie');
      expect(listPage.currentFilters.getText()).toContain('Haiti: Jeremie');
    });

    it('should filter users by Operation', function () {
      browser.sleep(3000);
      listPage.openListFilters();
      listPage.filterByOperation('Haiti');
      expect(listPage.currentFilters.getText()).toContain('Haiti');
    });

  });

  describe('Filtering by occupation', function () {
    beforeAll(function () {
      browser.sleep(3000);
      listPage.openOccupationFilters();
    });

    it('should filter users by Group', function () {
      browser.sleep(3000);
      listPage.filterByGroup('Haiti: Assessment Working Group');
      expect(listPage.currentFilters.getText()).toContain('Haiti: Assessment Working Group');
    });

    it('should filter users by Role', function () {
      browser.sleep(3000);
      listPage.openListFilters();
      listPage.filterByRole('Administrative Officer');
      expect(listPage.currentFilters.getText()).toContain('Administrative Officer');
    });
  });


  afterAll(function () {
    navObject.logOut();
  });
});
