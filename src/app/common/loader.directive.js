/**
 * Icons
 * Usage: <loader type="" text=""></loader>
 * Type is optional, set to 'inline' to not have the loader cover the page
 * Text is optional, give a string to over-ride the default text 'Loading'. To have no text, give an empty string.
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('loader', loader);

  function loader() {

    function buildTemplate (type, text) {
      var loaderText = text || 'Loading';
      var loaderTemplate = '<div class="loader"><span class="loader__icon"></span>';
      if (text !== '') {
        loaderTemplate += '<span translate>' + loaderText + '</span>';
      }
      loaderTemplate += '</div>';
      if (type === 'inline') {
        return loaderTemplate;
      }
      return '<div class="loader-container">' + loaderTemplate + '</div>';
    }

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
        type: '@',
        text: '@'
      },
      link: function(scope, element) {
        element.html(buildTemplate(scope.type, scope.text));
      }
    };

    return directive;
  }
})();
