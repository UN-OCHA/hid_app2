(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserExportCtrl', UserExportCtrl);

  UserExportCtrl.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$uibModal'];

  function UserExportCtrl($exceptionHandler, $rootScope, $scope, $uibModal) {
    $scope.exportEmails = exportEmails;
    $scope.closeExportEmailslModal = closeExportEmailslModal;
    $scope.exportCSV = exportCSV;
    $scope.exportPDF = exportPDF;
    $scope.exportGSS = exportGSS;
    $scope.googleToken = googleToken;
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
        $exceptionHandler(error, 'Export emails error');
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

    function exportGSS (docs) {
      $rootScope.$broadcast('users-export-gss', docs[0]);
    }

    function googleToken (authInstance) {
      var authPromise = {};
      if ($scope.currentUser.googleCredentials === false) {
        authPromise = authInstance.grantOfflineAccess({redirect_uri: 'postmessage'})
          .then(function (code) {
            return $scope.currentUser.saveGoogleCredentials(code.code);
          })
          .then(function (resp) {
            $scope.currentUser.googleCredentials = true;
            $scope.setCurrentUser($scope.currentUser);
            return authInstance.signIn();
          });
      }
      else {
        authPromise = authInstance.signIn();
      }
      return authPromise
          .then(function (guser) {
            var response = guser.getAuthResponse();
            return response.access_token;
          });
    }
  }
})();
