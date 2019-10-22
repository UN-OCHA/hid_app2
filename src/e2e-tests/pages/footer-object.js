/* jshint module: true */
var FooterObject = function() {
  this.aboutLink = element(by.css('.cd-footer .footer-links__item:nth-child(1)'));
  this.supportLink = element(by.css('.cd-footer .footer-links__item:nth-child(2)'));
  this.blogLink = element(by.css('.cd-footer .footer-links__item:nth-child(3)'));
  this.developersLink = element(by.css('.cd-footer .footer-links__item:nth-child(4)'));
  this.conductLink = element(by.css('.cd-footer .footer-links__item:nth-child(5)'));
  this.termsLink = element(by.css('.cd-footer .footer-links__item:nth-child(6)'));
  this.contactLink = element(by.css('.cd-footer .footer-links__item:nth-child(7) a'));
};

module.exports = FooterObject;
