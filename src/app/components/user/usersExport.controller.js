(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserExportCtrl', UserExportCtrl);

  UserExportCtrl.$inject = ['$log', '$rootScope', '$scope', '$uibModal'];

  function UserExportCtrl($log, $rootScope, $scope, $uibModal) {
    $scope.exportEmails = exportEmails;
    $scope.closeExportEmailslModal = closeExportEmailslModal;
    $scope.exportCSV = exportCSV;
    $scope.exportPDF = exportPDF;
    $scope.emailsText = '';
    var exportEmailModal;

    function showExportEmailsModal (resp) {
      $scope.emailsText = resp.data;
      exportEmailModal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'exportEmailsModal.html',
        size: 'lg',
        scope: $scope,
      });
    }

    // TODO: fix issue that only x first emails are exported
    function exportEmails () {
      $rootScope.$broadcast('users-export-txt', function (resp) {
        showExportEmailsModal(resp);
      }, function (error) {
        $log.error('Export emails error', error);
      });
    }

    function closeExportEmailslModal () {
      exportEmailModal.close();
    }

    function exportCSV () {
      $rootScope.$broadcast('users-export-csv');
    }

    function exportPDF (format) {
      $rootScope.$broadcast('users-export-pdf', format);
    }

  }
})();
