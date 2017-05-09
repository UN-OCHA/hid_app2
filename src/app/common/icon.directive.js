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

  icon.$inject = ['$rootScope'];
  function icon($rootScope) {

    var directive = {
      restrict: 'AE',
      replace: 'true',
      scope: {
        name: '@',
        text: '@'
      },
      templateUrl: 'app/common/icon-template.html',
      link: function (scope) {
        scope.url = iconUrl(scope.name);

        // re-generate the icon url on route change and update to fix Firefox issue with using
        // xlink and base
        $rootScope.$on('$routeChangeSuccess', function () {
          scope.url = iconUrl(scope.name);
        });

        $rootScope.$on('$routeUpdate', function () {
          scope.url = iconUrl(scope.name);
        });
      }
    };

    function iconUrl (name) {
      return window.location.href + '#icon-' + name;
    }

    return directive;
  }
})();

