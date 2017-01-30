(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServicesCtrl', ServicesCtrl);

  ServicesCtrl.$inject = ['$scope', '$routeParams', 'Service', 'alertService', 'gettextCatalog'];

  function ServicesCtrl ($scope, $routeParams, Service, alertService, gettextCatalog) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';
    $scope.servicesLoaded = false;

    var setTotalServices = function (clients, headers) {
      $scope.totalItems = headers()["x-total-count"];
      $scope.servicesLoaded = true;
    };

    $scope.services = Service.query($scope.request, setTotalServices);

    $scope.subscribe = function (service, user) {
      service.subscribe(user)
        .then(function(response) {
          if (user.id === $scope.currentUser.id) {
            $scope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully subscribed to this service'));
          }
          else {
            alertService.add('success', gettextCatalog.getString('The user was successfully subscribed to this service'));
          }
        })
        .catch(function (err) {
          alertService.add('danger', gettextCatalog.getString('We could not subscribe you to this service'));
        });
    };

    $scope.unsubscribe = function (service, user) {
      service.unsubscribe(user)
        .then(function (response) {
          if (user.id == $scope.currentUser.id) {
            $scope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'));
          }
          else {
            alertService.add('success', gettextCatalog.getString('The user was successfully unsubscribed from this service'));
          }
        })
        .catch(function (err) {
          alertService.add('danger', gettextCatalog.getString('We could not unsubscribe you from this service'));
        });
    };

    $scope.deleteService = function (service) {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        service.$delete(function (resp, headers) {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
        });
      });
    };
  }
})();
