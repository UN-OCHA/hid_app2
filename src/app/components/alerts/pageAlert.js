(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('pageAlert', pageAlert);

  pageAlert.$inject = ['$sce'];

  function pageAlert($sce) {

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
        iconname: '@',
        type: '@',
        message: '@'
      },
      templateUrl: 'app/components/alerts/page-alert.html',
      link: function (scope) {
        scope.$watch('message', function(value) {
          scope.messageHtml = $sce.trustAsHtml(scope.message);
        })
      }
    };

    return directive;
  }
})();
