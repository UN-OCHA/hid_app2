/**
 * Tabs
 * Usage:
 * <tabset>
 *   <tab heading="Tab Heading 1">
 *     Tab content 1
 *   </tab>
 *   <tab heading="Tab Heading 2">
 *     Tab content 2
 *  </tab>
 * </tabset>
 * Options (add to the tabset):
 * 'responsive' - set to true to make the tabs change to accordians on small screens
 * 'vertical' - set to true to have the tabs stack vertically at the side of the content
 *
 * 'default' - set on the tab to show that one open by default on desktop
 */

 (function() {
  'use strict';

  angular
  .module('app.common')
  .directive('tab', tab);

  function tab() {
    var directive = {
      require: '^tabset',
      restrict: 'E',
      scope: {
        default: '=',
        heading: '@'
      },
      transclude: true,
      templateUrl: 'app/components/tabs/tab.html',
      link: function(scope, elem, attr, tabsetCtrl) {
        scope.toggle = function () {
          tabsetCtrl.toggle(scope);
        };

        tabsetCtrl.addTab(scope);
      }
    };

    return directive;
  }
})();
