(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceCtrl', ServiceCtrl);

  ServiceCtrl.$inject = ['$scope', '$routeParams', '$http', '$log', '$window', '$location', 'gettextCatalog', 'alertService', 'Service', 'ServiceCredentials', 'List', 'User'];

  function ServiceCtrl ($scope, $routeParams, $http, $log, $window, $location, gettextCatalog, alertService, Service, ServiceCredentials, List, User) {
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
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 50,
      totalItems: 0
    };

    var offset = 0;

    if ($routeParams.serviceId) {
      $scope.service = Service.get({'serviceId': $routeParams.serviceId}, function() {
        $scope.getSubscribers();
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
      $scope.service.managers = [];
      $scope.service.lists = [];
      $scope.credentials = ServiceCredentials.query();
    }

    function subscribeManagersAndOwners (service) {
      var ownerId = service.owner;
      var userIds = angular.copy(service.managers);
      userIds.push(ownerId);

      angular.forEach(userIds, function(userId) {
        var isSubscribed = $scope.subscribers.find(function (subscriber) {
          return subscriber._id === userId;
        });

        if (!isSubscribed) {
          service.subscribe({_id: userId}).then(function() {}).catch(function (err) {
            $log.error(err);
          });
        }
      });
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

          $scope.subscribers.push(user);
        })
        .catch(function () {
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

          $scope.subscribers.splice($scope.subscribers.indexOf(user), 1);
        })
        .catch(function () {
          alertService.add('danger', gettextCatalog.getString('We could not unsubscribe you from this service'));
        });
    };

    $scope.saveService = function() {
      var success = function (resp) {
        alertService.add('success', gettextCatalog.getString('Service saved successfully'));
        subscribeManagersAndOwners(resp);
        $location.path('/services');
      };
      var error = function () {
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
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        $scope.service.$delete(function () {
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
      var inLists = $scope.service.lists.find(function (selectedList) {
        return selectedList._id === list._id;
      });
      return inLists ? true : false;
    };

    $scope.getUsers = function(search) {
      $scope.newUsers = User.query({'name': search});
    };

    $scope.removeManager = function (list) {
      $scope.service.managers.splice($scope.service.managers.indexOf(list), 1);
    };

    $scope.isSelectedManager = function (user) {
      var inManagers = $scope.service.managers.find(function (manager) {
        return manager._id === user._id;
      });
      return inManagers ? true : false;
    };

    $scope.pageChanged = function () {
      offset = ($scope.pagination.currentPage - 1);
      $scope.getSubscribers();
    };

    $scope.getSubscribers = function () {
      User.query({subscriptions: $scope.service._id, limit: $scope.pagination.itemsPerPage, offset: offset}, function (response) {
        $scope.subscribers = response;
        $scope.pagination.totalItems = response.headers['x-total-count'];
      });
    };
    
  }
})();
