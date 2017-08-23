(function () {
  'use strict';

  angular
  .module('app.service')
  .controller('SuggestionsCtrl', SuggestionsCtrl);

  SuggestionsCtrl.$inject = ['$exceptionHandler', '$location', '$q', '$routeParams', '$scope', 'alertService', 'Service', 'User', 'gettextCatalog'];

  function SuggestionsCtrl ($exceptionHandler, $location, $q, $routeParams, $scope, alertService, Service, User, gettextCatalog) {
    $scope.services = [];
    $scope.user = {};
    $scope.suggestions = {};
    $scope.subscribe = subscribe;
    $scope.skipSuggestions = skipSuggestions;
    var lists = $routeParams.lists;

    function getServices () {
      var userId = $routeParams.userId ? $routeParams.userId : $scope.currentUser._id;
      $scope.services = Service.suggestedServices;
      User.get({userId: userId}, function (user) {
        $scope.user = user;
        if (!Service.suggestedServices.length && lists) {
          Service.getSuggestions(lists, $scope.user).$promise.then(function (services) {
            $scope.services = Service.suggestedServices;
          });
        }
      });
    }

    function subscribe () {
      var promises = [];

      angular.forEach($scope.services, function (service) {
        if (!service.selected) {
          return;
        }
        promises.push(service.subscribe($scope.user));
      });

      $q.all(promises).then(function () {

        User.get({userId: $scope.user._id}, function (user) {
          Service.suggestions = [];
          if ($scope.currentUser._id === $scope.user._id) {
            $scope.setCurrentUser(user);
            alertService.add('success', gettextCatalog.getString('You were successfully subscribed'));
          }
          else {
            alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully subscribed'));
          }
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
