/**
  * Alert service for showing success, error and confirm modals
  *
  * Usage: alertService.add(type, msg, confirm, callback)
  * type -  string, options: 'success', 'danger'. Sets the style of the modal.
  * message - string, the message to display
  * confirm - boolean, if the modal is a confirm
  * callback - function, callback function that is called with the result of the confirm
  * displayTime - number, the length of time to display the modal for, if not set defaults to 3000
  */

(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('alertService', alertService);

  alertService.$inject = ['$rootScope', '$uibModal'];

  function alertService($rootScope, $uibModal) {

    var alertService = {};

    var defaultDisplayTime = 3000;

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

    function showModal (type, msg, confirm, displayTime) {
      var modalClass = confirm ? 'alert-modal modal-confirm' : 'alert-modal modal-' + type;
      var time = displayTime || defaultDisplayTime;

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
            }, time);
          }
        }
      });
      return modal.result;
    }

    alertService.add = function(type, msg, confirm, callback, displayTime) {
      confirm = confirm || false;
      callback = callback || false;

      return showModal(type, msg, confirm, displayTime).then(function () {
        return callback ? callback() : true;
      }, function () {
        return;
      });

    };

    return alertService;

  }

})();

