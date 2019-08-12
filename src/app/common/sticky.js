/*
 * Stickky directive
 * Usage:
 * set either a specifice breakpoint, e.g. stickypoint="100"
 * or
 * an element, the bottom of which will be the point at which the sticky element sticks, e.g. stickyelement=".page-header"
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('sticky', sticky);

  sticky.$inject = ['$document'];

  function sticky($document) {

    function getBreakpoint (attrs) {
      if (attrs.stickypoint) {
        return attrs.stickypoint;
      }

      if (attrs.stickyelement) {
        var el = $document[0].querySelector(attrs.stickyelement);
        if (el) {
        return el.offsetHeight + el.scrollHeight;
        }
      }

      return 0;
    }


    var directive = {
      restrict: 'A',
      link: function (scope, element, attrs) {

        $document[0].addEventListener('scroll', function () {
          var breakpoint = getBreakpoint(attrs);
          var scrollPosition = $document[0].body.scrollTop;

          if (scrollPosition > breakpoint) {
            element.addClass('sticky');
            return;
          }

          element.removeClass('sticky');

        });

      }

    };

    return directive;
  }
})();
