(function () {
  'use strict';

  angular
  .module('app.service')
  .controller('SuggestionsController', SuggestionsController);

  SuggestionsController.$inject = ['$exceptionHandler', '$location', '$q', '$routeParams', '$scope', 'alertService', 'Service', 'User', 'gettextCatalog'];

  function SuggestionsController ($exceptionHandler, $location, $q, $routeParams, $scope, alertService, Service, User, gettextCatalog) {
    var thisScope = $scope;

    thisScope.services = [];
    thisScope.user = {};
    thisScope.suggestions = {};
    thisScope.subscribe = subscribe;
    thisScope.skipSuggestions = skipSuggestions;
    var lists = $routeParams.lists;

    function getServices () {
      var userId = $routeParams.userId ? $routeParams.userId : thisScope.currentUser._id;
      thisScope.services = Service.suggestedServices;
      User.get({userId: userId}, function (user) {
        thisScope.user = user;
        if (!Service.suggestedServices.length && lists) {
          Service.getSuggestions(lists, thisScope.user).$promise.then(function (services) {
            thisScope.services = Service.suggestedServices;
          });
        }
      });
    }

    function subscribe () {
      var promises = [];

      angular.forEach(thisScope.services, function (service) {
        if (!service.selected) {
          return;
        }
        promises.push(service.subscribe(thisScope.user));
      });

      $q.all(promises).then(function () {

        User.get({userId: thisScope.user._id}, function (user) {
          Service.suggestions = [];
          if (thisScope.currentUser._id === thisScope.user._id) {
            thisScope.setCurrentUser(user);
            alertService.add('success', gettextCatalog.getString('You were successfully subscribed'));
          }
          else {
            alertService.add('success', thisScope.user.name + gettextCatalog.getString(' was successfully subscribed'));
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
