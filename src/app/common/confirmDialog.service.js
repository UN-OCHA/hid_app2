(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('confirmDialog', confirmDialog);

  confirmDialog.$inject = ['$uibModal'];

  function confirmDialog($uibModal) {

    return function (message) {

      var template = '<div class="modal-body"><h2 translate>{{message}}</h2></div>';
      template += '<div class="modal-footer">';
      template += '<button class="btn-secondary" ng-click="modal.dismiss()" translate>Cancel</button>';
      template += '<button class="btn-primary" ng-click="modal.close()" translate>OK</button>';
      template += '</div>';

      var modal = $uibModal.open({
        size: 'sm',
        template: template,
        windowClass: 'modal-confirm',
        controller: function ($scope, $uibModalInstance) {
          $scope.modal = $uibModalInstance;
          $scope.message = message;
        }
      });
      return modal.result;
    };
  }

})();
