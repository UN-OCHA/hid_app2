/**
 * Icons
 * Usage: <loader></loader>
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('loader', loader);

  function loader() {

    var directive = {
      restrict: 'AE',
      replace: 'true',
      template: '<div class="loader"><span class="loader__icon"></span><span translate>Loading</span></div>'
    };

    return directive;
  }
})();
