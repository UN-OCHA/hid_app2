var clientServices = angular.module('clientServices', ['ngResource']);

clientServices.factory('Client', ['$resource', '$http', '$location', 'config',
  function($resource, $http, $location, config){

    var Client = $resource(config.apiUrl + 'client/:clientId', {clientId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    return Client;
    
  }
]);

var clientControllers = angular.module('clientControllers', []);

clientControllers.controller('ClientCtrl', ['$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'Client', function($scope, $routeParams, $http, $window, gettextCatalog, alertService, Client) {
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
}]);

clientControllers.controller('ClientsCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'alertService', 'Client', function($scope, $routeParams, $q, gettextCatalog, alertService, Client) {
  $scope.request = $routeParams;
  $scope.totalItems = 0;
  $scope.itemsPerPage = 10;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.offset = 0;
  $scope.request.sort = 'name';

  var queryCallback = function (clients, headers) {
    $scope.totalItems = headers()["x-total-count"];
  };

  $scope.clients = Client.query($scope.request, queryCallback);

}]);

