(function () {
  'use strict';

  angular
  .module('app.service')
  .controller('SuggestionsCtrl', SuggestionsCtrl);

  SuggestionsCtrl.$inject = ['$exceptionHandler', '$location', '$q', '$routeParams', '$scope', 'alertService', 'Service', 'User', 'gettextCatalog'];

  function SuggestionsCtrl ($exceptionHandler, $location, $q, $routeParams, $scope, alertService, Service, User, gettextCatalog) {
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
          alertService.add('success', gettextCatalog.getString('You were successfully subscribed'));
          $location.url('/dashboard');
          return;
        });

      }, function (error) {
        $exceptionHandler(error, 'Subscribe error');
      });
    }

    function skipSuggestions () {
      Service.suggestions = [];
      $location.url('/dashboard');
    }

    getServices();

  }
})();
