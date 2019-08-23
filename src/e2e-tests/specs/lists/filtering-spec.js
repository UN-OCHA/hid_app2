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
      listPage.closeFilters();
    });
  });

  describe('Filtering by location', function () {
    beforeEach(function () {
      browser.sleep(1000);
    });

    it('should filter by country', function () {
      // Open filters side bar
      listPage.openListFilters();
      browser.sleep(500);

      // Open locations filters
      listPage.locationFiltersButton.click();
      browser.wait(listPage.countryFilter.isDisplayed, 5000);

      // Focus country filter
      listPage.countryFilterToggle.click();
      browser.wait(listPage.countryFilterInput.isDisplayed, 5000);

      // Type into country filter
      listPage.countryFilterInput.sendKeys('United Kingdom');

      // Select a country
      browser.wait(listPage.countryFilterOption.isDisplayed, 5000);
      expect(listPage.countryFilterOption.getText()).toContain('United Kingdom');
      listPage.countryFilterOption.click();

      // Click apply button
      listPage.applyFiltersButton.click();
      browser.sleep(500);

      // Check filtered results
      expect(listPage.currentFilters.getText()).toContain('United Kingdom');
      expect(listPage.listUsers.getText()).not.toContain('Andrej Verity');
      expect(listPage.listUsers.getText()).toContain('Emma HOGBIN WESTBY');

      // Clear location
      listPage.clearFilters();
      listPage.closeFilters();
    });


    it('should filter users by disaster', function () {
      const disasterName = 'Haiti: Haiti: Earthquakes - Jan 2010';
      listPage.openListFilters();
      listPage.filterByDisaster(disasterName);
      expect(listPage.currentFilters.getText()).toContain(disasterName);
    });

    it('should filter users by Operation', function () {
      const operationName = 'Haiti';
      listPage.openListFilters();
      listPage.filterByOperation(operationName);
      expect(listPage.currentFilters.getText()).toContain(operationName);
    });

    it('should filter users by Coordination Hub', function () {
      const officeName = 'Haiti: Jeremie';
      listPage.openListFilters();
      listPage.filterByOffice(officeName);
      expect(listPage.currentFilters.getText()).toContain(officeName);
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
