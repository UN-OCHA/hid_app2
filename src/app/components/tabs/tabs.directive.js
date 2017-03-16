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

  angular
  .module('app.common')
  .directive('tabset', tabset);

  function tabset() {
    var directive = {
      restrict: 'E',
      transclude: true,
      scope: {
        vertical: '@',
        responsive: '@' 
      },
      templateUrl: 'app/components/tabs/tabset.html',
      bindToController: true,
      controllerAs: 'tabset',
      controller: function() {
        var defaultTab = 1;
        var self = this;
        self.tabs = [];

        self.addTab = function addTab(tab) {
          self.tabs.push(tab);
          tab.id = self.tabs.length;
          tab.responsive = self.responsive;
          tab.vertical = self.vertical;

          if (tab.default) {
            defaultTab = self.tabs.length;
          }

          if (defaultTab !== 1) {
            angular.forEach(self.tabs, function (tab) {
              if (tab.default) {
                tab.desktopActive = true;
                return;
              }
              tab.desktopActive = false;
            });
            return;
          } 

          if (self.tabs.length === defaultTab) {
            tab.desktopActive = true;
          }
        };

        self.toggle = function (selectedTab) {
          angular.forEach(self.tabs, function(tab) {
            if (tab.id === selectedTab.id) {
              tab.mobileActive = !tab.mobileActive;
              tab.desktopActive = true;
              return;
            } 
            tab.desktopActive = false;
            
          });
        };
      }
    };

    return directive;
  }
})();
