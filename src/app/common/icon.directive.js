/**
 * Icons
 * Usage: <icon name="wheel" text="Actions"></icon>
 * Name is the icon name, see https://un-ocha.github.io/styleguide/hid/icons.html for available icons
 * Text is optional, it should be given if there is no visible text accompanying the icon
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('icon', icon);

  function icon() {

    var directive = {
      restrict: 'AE',
      replace: 'true',
      scope: {
        name: '@',
        text: '@'
      },
      templateUrl: 'app/common/icon-template.html',
      link: function (scope) {
        scope.url = '#icon-' + scope.name;
      }
    };

    return directive;
  }
})();
