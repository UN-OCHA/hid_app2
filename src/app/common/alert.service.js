(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('alertService', alertService);

  alertService.$inject = ['$rootScope', '$uibModal'];

  function alertService($rootScope, $uibModal) {

    var alertService = {};

    function buildModalTemplate (type, msg, confirm) {
      var iconName = '';
      var icon = '';

      if (type === 'success' || type === 'danger') {
        iconName = type === 'success' ? 'check-circle' : 'caution';
        icon = '<icon name="' + iconName + '" class="modal-icon"></icon>';
      }

      var body = '<div class="modal-body">' + icon + '<h2 translate>{{message}}</h2></div>';
      var closeButton = '<button class="btn-primary" ng-click="modal.close()" translate>Close</button>';

      var confirmButtons = '<button class="btn-secondary" ng-click="modal.dismiss()" translate>Cancel</button>';
      confirmButtons += '<button class="btn-primary" ng-click="modal.close()" translate>OK</button>';

      var footer = '<div class="modal-footer">';
      footer += confirm ? confirmButtons : closeButton;
      footer += '</div>';

      return body + footer;
    }

    function showModal (type, msg, confirm) {
      var modalClass = confirm ? 'modal-confirm' : 'modal-' + type;

      var modal = $uibModal.open({
        animation: false,
        size: 'sm',
        template: buildModalTemplate(type, msg, confirm),
        windowClass: modalClass,
        controller: function ($scope, $uibModalInstance) {
          $scope.modal = $uibModalInstance;
          $scope.message = msg;

          if (!confirm) {
            setTimeout(function () {
              $scope.modal.close();
            }, 3000);
          }
        }
      });
      return modal.result;
    }

    alertService.add = function(type, msg, confirm, cb) {
      confirm = confirm || false;
      cb = cb || false;

      return showModal(type, msg, confirm).then(function () {
        return cb ? cb() : true;
      }, function () {
        return;
      });

    };

    return alertService;

  }

})();

