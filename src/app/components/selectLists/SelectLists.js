(function() {
  'use strict';

  angular
    .module('app.list')
    .directive('SelectLists', SelectLists);

  function SelectLists() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/selectLists/select-lists.html',
      scope: true,
      controller: 'SelectListsCtrl'
    };

    return directive;
  }
})();
