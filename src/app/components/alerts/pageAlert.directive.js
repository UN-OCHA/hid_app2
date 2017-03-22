(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('pageAlert', pageAlert);

  function pageAlert() {

    var directive = {
      restrict: 'EA',
      replace: 'true',
      scope: {
        iconname: '@',
        type: '@',
        message: '@'
      },
      templateUrl: 'app/components/alerts/page-alert.html',
      controller: function ($scope, $sce) {
        $scope.$watch('message', function(value) {
          $scope.messageHtml = $sce.trustAsHtml($scope.message);
        })

      }
    };

    return directive;
  }
})();
