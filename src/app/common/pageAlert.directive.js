(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('pageAlert', pageAlert);

  function pageAlert() {

    function buildTemplate (type, message, icon) {
      var iconHTML = '';
      if (icon) {
        iconHTML = '<span class="iconholder alert__icon"><i class="icon icon-' + icon + '" aria-hidden="true"></i></span>';
      }
      var messageText = '<p translate>' +  message + '</p>';
      var alert = '<div class="alert alert--' + type + '"><div class="container alert__inner">' + iconHTML + messageText + '</div></div>';
      return alert;
    }

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
        iconname: '@',
        type: '@',
        message: '@'
      },
      link: function(scope, element) {
        element.html(buildTemplate(scope.type, scope.message, scope.iconname));
      }
    };

    return directive;
  }
})();
