(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('ClientCtrl', ClientCtrl);

  ClientCtrl.$inject = ['$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'Client'];

  function ClientCtrl ($scope, $routeParams, $http, $window, gettextCatalog, alertService, Client) {
    if ($routeParams.clientId) {
      $scope.client = Client.get({'clientId': $routeParams.clientId});
    }
    else {
      $scope.client = new Client();
    }

    $scope.saveClient = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Client save successfully'));
      };
      var error = function (err) {
        alertService.add('danger', gettextCatalog.getString('There was an error saving this client'));
      };
      if ($scope.client._id) {
        $scope.client.$update(success, error);
      }
      else {
        $scope.client.$save(success, error);
      }
    };

    $scope.deleteClient = function () {
      $scope.client.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Client deleted successfully'));
      });
    };
  }
})();