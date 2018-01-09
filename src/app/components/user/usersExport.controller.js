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

    function exportGSS () {
      $rootScope.$broadcast('users-export-gss');
    }

    function googleToken () {
      gapi.load('auth2', { callback: function () {
        gapi.auth2.init({
          'client_id' : '902129611692-jq1ne5q6fngs72lcbp1e6sdufiat1197.apps.googleusercontent.com',
          'scope'     : 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
        })
        .then(function (authInstance) {
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
        })
        .then(function (token) {
          $scope.exportGSS();
        });
      }});
    }
  }
})();
