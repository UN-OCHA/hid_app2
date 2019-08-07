(function() {
  'use strict';

  angular
    .module('app.service')
    .directive('ServicesList', ServicesList);

  function ServicesList() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/service/services.html',
      scope: true,
      controller: 'ServicesController'
    };

    return directive;
  }
})();
