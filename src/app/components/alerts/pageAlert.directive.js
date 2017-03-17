(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('pageAlert', pageAlert);

  function pageAlert() {

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
        iconname: '@',
        type: '@',
        message: '@'
      },
      templateUrl: 'app/components/alerts/page-alert.html',
    };

    return directive;
  }
})();
