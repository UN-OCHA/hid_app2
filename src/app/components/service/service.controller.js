(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceCtrl', ServiceCtrl);

  ServiceCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$http', '$log', '$window', '$location', 'gettextCatalog', 'alertService', 'Service', 'ServiceCredentials', 'List', 'User'];

  function ServiceCtrl ($exceptionHandler, $scope, $routeParams, $http, $log, $window, $location, gettextCatalog, alertService, Service, ServiceCredentials, List, User) {
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
    $scope.isSubscribed = false;
    $scope.userSubscribed = {};
    $scope.userUnsubscribed = {};
    $scope.subscribers = [];
    $scope.subscribersLoaded = false;
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 50,
      totalItems: 0
    };
    $scope.selectedLists = [];// used by nested select lists controller

    if ($routeParams.serviceId) {
      $scope.service = Service.get({'serviceId': $routeParams.serviceId}, function() {
        $scope.selectedLists = $scope.service.lists;
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
        var isSubscribed = $scope.subscribers.filter(function (subscriber) {
          return subscriber._id === userId;
        })[0];

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
          $scope.newUsers = [];
          $scope.subscribers.push(user);
        })
        .catch(function (error) {
          alertService.add('danger', gettextCatalog.getString('We could not subscribe you to this service'));
          $exceptionHandler(error, 'Subscribe fail');
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
        .catch(function (error) {
          alertService.add('danger', gettextCatalog.getString('We could not unsubscribe you from this service'));
          $exceptionHandler(error, 'Unsubscribe fail');
        });
    };

    $scope.saveService = function() {
      $scope.service.lists = $scope.selectedLists;
      var success = function (resp) {
        alertService.add('success', gettextCatalog.getString('Service saved successfully'));
        subscribeManagersAndOwners(resp);
        $location.path('/services');
      };
      var error = function () {
        alertService.add('danger', gettextCatalog.getString('There was an error saving this service'));
        $exceptionHandler(error, 'Save service fail');
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
        }, function () {
          alertService.add('danger', gettextCatalog.getString('Invalid API key'));
          $scope.service.mailchimp.apiKey = '';
          $scope.mailchimpLists = [];
        });
    };

    $scope.getGoogleGroups = function () {
      Service
        .getGoogleGroups($scope.service.googlegroup.domain)
        .then(function (result) {
          $scope.googleGroups = result.data;
        });
    };

    function filterUsers (users, subscribers) {
      if (!subscribers.length) {
        return users;
      }
      var serviceId = $scope.service._id;
      var filteredUsers = [];

      angular.forEach(users, function (user) {
        var isSubscribed = false;
        if (!user.subscriptions.length) {
          filteredUsers.push(user);
          return;
        }
        angular.forEach(user.subscriptions, function (subscription) {
          if (subscription.service === serviceId) {
            isSubscribed = true;
          }
        });

        if (!isSubscribed) {
          filteredUsers.push(user);
        }

      });

      return filteredUsers;
    }

    $scope.getUsers = function(search) {
      User.query({'name': search}, function (users) {
        $scope.newUsers = filterUsers(users, $scope.subscribers);
      });
    };

    $scope.removeManager = function (list) {
      $scope.service.managers.splice($scope.service.managers.indexOf(list), 1);
    };

    $scope.isSelectedManager = function (user) {
      var inManagers = $scope.service.managers.filter(function (manager) {
        return manager._id === user._id;
      })[0];
      return inManagers ? true : false;
    };

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      $scope.getSubscribers(offset);
    };

    $scope.getSubscribers = function (offset) {
      var params = {
        'subscriptions.service': $scope.service._id,
        limit: $scope.pagination.itemsPerPage,
        sort: 'name'
      };
      params.offset = offset || 0;
      User.query(params, function (response, headers) {
        $scope.subscribers = response;
        $scope.pagination.totalItems = headers()['x-total-count'];
        $scope.subscribersLoaded = true;
      });
    };
    
  }
})();
