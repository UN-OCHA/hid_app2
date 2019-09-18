(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('ClientController', ClientController);

  ClientController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'Client'];

  function ClientController ($exceptionHandler, $scope, $routeParams, $http, $window, gettextCatalog, alertService, Client) {
    var thisScope = $scope;
    if ($routeParams.clientId) {
      thisScope.client = Client.get({'clientId': $routeParams.clientId});
    }
    else {
      thisScope.client = new Client();
    }

    thisScope.saveClient = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Client saved successfully'));
      };
      var error = function (err) {
        $exceptionHandler(error, 'Save client');
      };
      thisScope.client.redirectUrls = thisScope.client.redirectUrls.split("\n").map(function (url) { return url.trim(); });
      if (thisScope.client._id) {
        thisScope.client.$update(success, error);
      }
      else {
        thisScope.client.$save(success, error);
      }
    };

    thisScope.deleteClient = function () {
      thisScope.client.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Client deleted successfully'));
      });
    };
  }
})();
