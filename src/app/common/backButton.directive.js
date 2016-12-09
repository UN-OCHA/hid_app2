(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('backButton', backButton);

  backButton.$inject = ['$window'];

  function backButton($window) {

    var directive = {
      restrict: 'A',
      link: function (scope, elem) {
        elem.bind('click', function () {
          $window.history.back();
        });
      }
    };

    return directive;
  }
})();
