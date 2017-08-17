(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServicesCtrl', ServicesCtrl);

  ServicesCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', 'Service', 'alertService', 'gettextCatalog'];

  function ServicesCtrl ($exceptionHandler, $scope, $routeParams, Service, alertService, gettextCatalog) {
    $scope.servicesLoaded = false;
    $scope.services = [];
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    function getServices (offset) {
      var params = {
        sort: 'name',
        limit: $scope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      Service.query(params, function (services, headers) {
        $scope.services = services;
        $scope.pagination.totalItems = headers()["x-total-count"];
        $scope.servicesLoaded = true;
      });
    }

    getServices();

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
        .catch(function (error) {
          $exceptionHandler(error, 'Subscribe fail');
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
        .catch(function (error) {
          $exceptionHandler(error, 'Unsubscribe fail');
        });
    };

    $scope.deleteService = function (service) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
        });
      });
    };

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getServices(offset);
    };
  }
})();
