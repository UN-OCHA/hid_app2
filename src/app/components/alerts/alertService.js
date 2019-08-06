/**
  * Alert service for showing success, error and confirm modals. Plus in page alerts under the header.
  *
  * Usage: alertService.add(type, msg, confirm, callback)
  * type -  string, options: 'success', 'danger'. Sets the style of the modal.
  * message - string, the message to display
  * confirm - boolean, if the modal is a confirm
  * callback - function, callback function that is called with the result of the confirm
  * displayTime - number, the length of time to display the modal for, if not set defaults to 3000
  *
  * alertService.pageAlert(type, message, icon)
  * type -  string, options: 'success', 'warning', 'danger'. Sets the style of the modal.
  * message - string, the message to display
  * icon - string, name of the icon to show. Optional
  */

(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('alertService', alertService);

  alertService.$inject = ['$rootScope', '$uibModal', 'gettextCatalog'];

  function alertService($rootScope, $uibModal, gettextCatalog) {

    var alertService = {};
    $rootScope.pageAlert = {};
    var defaultDisplayTime = 3000;
    var closeText = gettextCatalog.getString('Close');
    var cancelText = gettextCatalog.getString('Cancel')

    function buildModalTemplate (type, msg, confirm) {
      var iconName = '';
      var icon = '';

      if (type === 'success' || type === 'danger') {
        iconName = type === 'success' ? 'check-circle' : 'caution';
        icon = '<icon name="' + iconName + '" class="modal-icon"></icon>';
      }

      var body = '<div class="modal-body">' + icon + '<h2>' + msg + '</h2></div>';
      var closeButton = '<button class="btn-primary" ng-click="modal.close()" translate>' + closeText +'</button>';

      var confirmButtons = '<button class="btn-secondary" ng-click="modal.dismiss()" translate>' + cancelText + '</button>';
      confirmButtons += '<button class="btn-primary t-confirm-btn" ng-click="modal.close()" translate>OK</button>';

      var footer = '<div class="modal-footer">';
      footer += confirm ? confirmButtons : closeButton;
      footer += '</div>';

      return body + footer;
    }

    function showModal (type, msg, confirm, displayTime) {
      var modalClass = confirm ? 'alert-modal modal-confirm' : 'alert-modal modal-' + type;
      var time = Number.isInteger(displayTime) ? displayTime : defaultDisplayTime;

      var modal = $uibModal.open({
        animation: false,
        size: 'sm',
        template: buildModalTemplate(type, msg, confirm),
        windowClass: modalClass,
        controller: function ($scope, $uibModalInstance) {
          $scope.modal = $uibModalInstance;
          $scope.message = msg;

          if (!confirm && time !== 0) {
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

      return showModal(type, msg, confirm, 0).then(function () {
        return callback ? callback() : true;
      }, function () {
        return;
      });

    };

    alertService.pageAlert = function (type, message, icon) {
      $rootScope.pageAlert = {
        icon: icon,
        show: true,
        message: message,
        type: type
      };
    };

    alertService.resetPageAlert = function () {
      $rootScope.pageAlert = {};
    };

    return alertService;

  }

})();
