(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserExportController', UserExportController);

  UserExportController.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$uibModal', '$window', '$location', 'User'];

  function UserExportController($exceptionHandler, $rootScope, $scope, $uibModal, $window, $location, User) {
    var thisScope = $scope;

    thisScope.exportEmails = exportEmails;
    thisScope.closeExportEmailslModal = closeExportEmailslModal;
    thisScope.exportCSV = exportCSV;
    thisScope.exportPDF = exportPDF;
    thisScope.exportGSS = exportGSS;
    thisScope.googleToken = googleToken;
    thisScope.outlookToken = outlookToken;
    thisScope.emailsText = '';
    var exportEmailModal;

    function showExportEmailsModal (resp) {
      thisScope.emailsText = resp.data;
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
          if (!thisScope.currentUser.googleCredentials) {
            authPromise = authInstance.grantOfflineAccess({redirect_uri: 'postmessage'})
              .then(function (code) {
                return thisScope.currentUser.saveGoogleCredentials(code.code);
              })
              .then(function (resp) {
                thisScope.currentUser.googleCredentials = true;
                thisScope.setCurrentUser(thisScope.currentUser);
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
          thisScope.exportGSS();
        });
      }});
    }

    function outlookGuid() {
      var cryptObj = $window.crypto || $window.msCrypto;
      var buf = new Uint16Array(8);
      cryptObj.getRandomValues(buf);
      function s4(num) {
        var ret = num.toString(16);
        while (ret.length < 4) {
          ret = '0' + ret;
        }
        return ret;
      }
      return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' +
        s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7]);
    }

    function buildOutlookAuthUrl() {
      // Generate random values for state and nonce
      sessionStorage.authState = outlookGuid();
      sessionStorage.authNonce = outlookGuid();

      var authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
      var redirectUri = $location.protocol() + '://' + $location.host() + '/outlook';
      var appId = 'c31cf820-b95c-4fbc-8546-eb94976bec0e';
      var scopes = 'openid offline_access User.Read Contacts.ReadWrite';

      var authParams = {
        response_type: 'code',
        client_id: appId,
        redirect_uri: redirectUri,
        scope: scopes,
        state: sessionStorage.authState,
        nonce: sessionStorage.authNonce,
        response_mode: 'fragment'
      };

      return authEndpoint + Object.keys(authParams).map(function(k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(authParams[k]);
      }).join('&');
    }

    function outlookToken() {
      if (!thisScope.currentUser.outlookCredentials) {
        $window.location.href = buildOutlookAuthUrl();
      }
      else {
        $rootScope.$broadcast('users-export-outlook');
      }
    }
  }
})();
