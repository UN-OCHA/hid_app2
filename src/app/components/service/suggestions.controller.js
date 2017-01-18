(function () {
  'use strict';

  angular
  .module('app.service')
  .controller('SuggestionsCtrl', SuggestionsCtrl);

  SuggestionsCtrl.$inject = ['$location', '$q', '$routeParams', '$scope', 'alertService', 'Service', 'User'];

  function SuggestionsCtrl ($location, $q, $routeParams, $scope, alertService, Service, User) {
    $scope.services = [];    
    $scope.suggestions = {};
    $scope.subscribe = subscribe;
    $scope.skipSuggestions = skipSuggestions;
    var lists = $routeParams.lists;

    function getServices () {
      $scope.services = Service.suggestedServices;
      if (!Service.suggestedServices.length && lists) {
        Service.getSuggestions(lists, $scope.currentUser).$promise.then(function (services) {
          $scope.services = Service.suggestedServices;
        });
      }
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

        User.get({userId: $scope.currentUser._id}, function (user) {
          $scope.setCurrentUser(user);
          Service.suggestions = [];
          alertService.add('success', 'You were successfully subscribed');
          $location.url('/dashboard');
          return;
        });

      }, function () {
        alertService.add('danger', 'There was an error subscribing you');
      });
    }

    function skipSuggestions () {
      Service.suggestions = [];
      $location.url('/dashboard');
    }

    getServices();

  }
})();
