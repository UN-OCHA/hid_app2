(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServicesController', ServicesController);

  ServicesController.$inject = ['$exceptionHandler', '$scope', '$routeParams', 'Service', 'alertService', 'gettextCatalog'];

  function ServicesController ($exceptionHandler, $scope, $routeParams, Service, alertService, gettextCatalog) {
    var thisScope = $scope;

    thisScope.servicesLoaded = false;
    thisScope.services = [];
    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };
    thisScope.query = '';

    function getServices (offset) {
      var params = {
        sort: 'name',
        limit: thisScope.pagination.itemsPerPage
      };
      params.offset = offset || 0;
      if (thisScope.query !== '' && thisScope.query.length > 2) {
        params.name = thisScope.query;
      }

      Service.query(params, function (services, headers) {
        thisScope.services = services;
        thisScope.pagination.totalItems = headers()["x-total-count"];
        thisScope.servicesLoaded = true;
      });
    }

    getServices();

    thisScope.subscribe = function (service, user) {
      service.subscribe(user)
        .then(function(response) {
          if (user.id === thisScope.currentUser.id) {
            thisScope.setCurrentUser(response.data);
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

    thisScope.unsubscribe = function (service, user) {
      service.unsubscribe(user)
        .then(function (response) {
          if (user.id == thisScope.currentUser.id) {
            thisScope.setCurrentUser(response.data);
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

    thisScope.deleteService = function (service) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
        });
      });
    };

    thisScope.pageChanged = function () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getServices(offset);
    };

    thisScope.search = function () {
      getServices(0);
    };
  }
})();
