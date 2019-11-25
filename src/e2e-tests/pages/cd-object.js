/* jshint module: true */
var CommonDesign = function() {
  this.ochaServicesButton = element(by.css('.cd-ocha-btn'));
  this.ochaServicesList = element(by.css('.cd-ocha-dropdown'));

  this.openOchaServices = function () {
    this.ochaServicesButton.click();
  };
};

module.exports = CommonDesign;
