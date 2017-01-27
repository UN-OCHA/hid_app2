/**
 * Icons
 * Usage: <loader type=""></loader>
 * Type is optional, set to 'inline' to not have the loader cover the page
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('loader', loader);

  function loader() {

    function buildTemplate (type) {
      var loaderTemplate = '<div class="loader"><span class="loader__icon"></span><span translate>Loading</span></div>';
      if (type === 'inline') {
        return loaderTemplate;
      }
      return '<div class="loader-container">' + loaderTemplate + '</div>';
    }

    
    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
        type: '@'
      },
      link: function(scope, element) {
        element.html(buildTemplate(scope.type));
      }
    };

    return directive;
  }
})();
