(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceCtrl', ServiceCtrl);

  ServiceCtrl.$inject = ['$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'Service', 'ServiceCredentials', 'List', 'User'];

  function ServiceCtrl ($scope, $routeParams, $http, $window, gettextCatalog, alertService, Service, ServiceCredentials, List, User) {
    $scope.serviceTypes = [
      {
        value: 'mailchimp',
        label: 'Mailchimp'
      },
      {
        value: 'googlegroup',
        label: 'Google Group'
      }
    ];
    $scope.mailchimpLists = [];
    $scope.credentials = [];
    $scope.newLists = [];
    $scope.newUsers = [];
    $scope.selectList = {};
    $scope.isSubscribed = false;
    $scope.userSubscribed = {};
    $scope.userUnsubscribed = {};

    if ($routeParams.serviceId) {
      $scope.service = Service.get({'serviceId': $routeParams.serviceId}, function() {
        $scope.getMailchimpLists();
        $scope.credentials = ServiceCredentials.query();
        for (var i = 0; i < $scope.currentUser.subscriptions.length; i++) {
          if ($scope.currentUser.subscriptions[i]._id === $scope.service._id) {
            $scope.isSubscribed = true;
          }
        }
      });
    }
    else {
      $scope.service = new Service();
      $scope.credentials = ServiceCredentials.query();
    }

    $scope.subscribe = function (user) {
      $scope.service.subscribe(user)
        .then(function(response) {
          if (user.id === $scope.currentUser.id) {
            $scope.setCurrentUser(response.data);
            $scope.isSubscribed = true;
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

    $scope.unsubscribe = function (user) {
      $scope.service.unsubscribe(user)
        .then(function (response) {
          if (user.id == $scope.currentUser.id) {
            $scope.setCurrentUser(response.data);
            $scope.isSubscribed = false;
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

    $scope.saveService = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Service saved successfully'));
      };
      var error = function (err) {
        alertService.add('danger', gettextCatalog.getString('There was an error saving this service'));
      };
      if ($scope.service._id) {
        $scope.service.$update(success, error);
      }
      else {
        $scope.service.$save(success, error);
      }
    };

    $scope.deleteService = function () {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.service.$delete(function (resp, headers) {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
        });
      });
    };

    $scope.getMailchimpLists = function () {
      Service
        .getMailchimpLists($scope.service.mailchimp.apiKey)
        .then(function (result) {
          $scope.mailchimpLists = result.data.lists;
        });
    };

    $scope.getGoogleGroups = function () {
      Service
        .getGoogleGroups($scope.service.googlegroup.domain)
        .then(function (result) {
          console.log(result);
          $scope.googleGroups = result.data;
        });
    };

    // Retrieve lists
    $scope.getLists = function(search) {
      $scope.newLists = List.query({'name': search});
    };

    $scope.removeList = function (list) {
      $scope.service.lists.splice($scope.service.lists.indexOf(list), 1);
    };

    $scope.isSelected = function (list) {
      return $scope.service.lists.indexOf(list) !== -1;
    };

    $scope.getUsers = function(search) {
      $scope.newUsers = User.query({'name': search});
    };

    $scope.removeOwner = function (list) {
      $scope.service.owners.splice($scope.service.owners.indexOf(list), 1);
    };

    $scope.isSelectedOwner = function (list) {
      return $scope.service.owners.indexOf(list) !== -1;
    };

  }
})();
