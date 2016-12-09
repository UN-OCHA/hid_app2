/**
 * Icons
 * Usage: <icon name="cog" text="Actions"></icon>
 * Name is the icon name, currently using FontAwesome
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
      template: '<span class="icon"><i class="fa fa-{{name}}" aria-hidden="true"></i><span ng-if="text" class="sr-only" translate>{{text}}</span></span>'
    };

    return directive;
  }
})();
