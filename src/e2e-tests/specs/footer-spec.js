/* jshint module: true */
var LoginPage = require('../pages/login-page');
var FooterObj = require('../pages/footer-object');

describe('Footer', function () {
  var loginPage = new LoginPage();
  var footerObj = new FooterObj();

  beforeEach(function () {
    loginPage.get();
  });

  it('should externally link to About', function () {
    var aboutUrl = 'https://about.humanitarian.id/';
    footerObj.aboutLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(aboutUrl);
  });

  it('should externally link to Support', function () {
    var supportUrl = 'https://about.humanitarian.id/support/';
    footerObj.supportLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(supportUrl);
  });

  it('should externally link to Blog', function () {
    var blogUrl = 'https://about.humanitarian.id/blog/';
    footerObj.blogLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(blogUrl);
  });

  it('should externally link to Developer docs', function () {
    var developersUrl = 'https://about.humanitarian.id/developers/';
    footerObj.developersLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(developersUrl);
  });

  it('should externally link to Code of Conduct', function () {
    var conductUrl = 'https://about.humanitarian.id/code-of-conduct/';
    footerObj.conductLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(conductUrl);
  });

  it('should externally link to Terms of Service', function () {
    var termsUrl = 'https://about.humanitarian.id/terms-of-service/';
    footerObj.termsLink.click();
    browser.waitForAngularEnabled(false);
    expect(browser.getCurrentUrl()).toBe(termsUrl);
  });

  it('should link to mailto:info@humanitarian.id', function () {
    expect(footerObj.contactLink.getAttribute('href')).toBe('mailto:info@humanitarian.id');
  });
});
