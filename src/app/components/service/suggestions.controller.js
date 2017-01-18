(function () {
  'use strict';

  angular
  .module('app.service')
  .controller('SuggestionsCtrl', SuggestionsCtrl);

  SuggestionsCtrl.$inject = ['$location', '$q', '$routeParams', '$scope', 'alertService', 'Service', 'User'];

  function SuggestionsCtrl ($location, $q, $routeParams, $scope, alertService, Service, User) {
    $scope.services = [];
    $scope.request = $routeParams;
    $scope.suggestions = {};
    $scope.subscribe = subscribe;
    $scope.skipSuggestions = skipSuggestions;

    function isSubscribed (service, user) {
      var subscribed = false;
      angular.forEach(user.subscriptions, function (subscription) {
        if (service._id === subscription._id) {
          return subscribed = true;
        }
      });
      return subscribed;
    }

    function filterServices (services, user) {
      if (!user.subscriptions.length) {
        return services;
      }

      var filteredServices = services.filter(function (service) {
        return !isSubscribed(service, user);
      });

      return filteredServices;
    }

    function getServices () {
      Service.query($scope.request, function (services) {
        $scope.services = filterServices(services, $scope.currentUser);

        if (!$scope.services.length) {
          alertService.add('success', 'You were successfully checked in');
          $location.path('/dashboard');
          return;
        }
      });
    }

    function updateUser () {
      User.get({userId: $scope.currentUser._id}, function (user) {
        $scope.setCurrentUser(user);
      });
    }

    function subscribe () {
      var promises = [];

      angular.forEach($scope.services, function (service) {
        if (!service.selected) {
          return;
        }

        promises.push(service.subscribe($scope.currentUser));
      });

      $q.all(promises).then(function () {
        updateUser();
        alertService.add('success', 'You were successfully subscribed');
        $location.path('/dashboard');
        return;
      });
    }

    function skipSuggestions () {
      $location.path('/dashboard');
    }

    getServices();

  }
})();
