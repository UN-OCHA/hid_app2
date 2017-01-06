(function() {
  'use strict';

  angular
    .module('app.service')
    .directive('servicesList', servicesList);

  function servicesList() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/service/services.html',
      scope: true,
      controller: 'ServicesCtrl'
    };

    return directive;
  }
})();
