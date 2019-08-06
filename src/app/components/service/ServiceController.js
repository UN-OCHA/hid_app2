(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceController', ServiceController);

  ServiceController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'Service', 'User'];

  function ServiceController ($exceptionHandler, $scope, $routeParams, $location, gettextCatalog, alertService, Service, User) {
    $scope.isSubscribed = false;
    $scope.userSubscribed = {};
    $scope.subscribers = [];
    $scope.subscribersLoaded = false;
    $scope.subscribe = subscribe;
    $scope.unsubscribe = unsubscribe;
    $scope.getUsers = getUsers;
    $scope.deleteService = deleteService;
    $scope.pageChanged = pageChanged;
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 50,
      totalItems: 0
    };

    function isUserSubscribed (user, serviceId) {
      for (var i = 0; i < user.subscriptions.length; i++) {
        if (user.subscriptions[i]._id === serviceId) {
          return true;
        }
      }

      return false;
    }

    function initService () {
      Service.get({'serviceId': $routeParams.serviceId}, function(service) {
        $scope.service = service;
        getSubscribers();
        $scope.isSubscribed = isUserSubscribed($scope.currentUser, $scope.service._id);
      });
    }
    initService();

    function subscribe (user) {
      $scope.service.subscribe(user)
        .then(function(response) {
          if (user._id === $scope.currentUser._id) {
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
          $exceptionHandler(error, 'Subscribe fail');
        });
    }

    function unsubscribe (user) {
      $scope.service.unsubscribe(user)
        .then(function (response) {
          if (user._id == $scope.currentUser._id) {
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
          $exceptionHandler(error, 'Unsubscribe fail');
        });
    }

    function deleteService () {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        $scope.service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
          $location.path('/services');
        });
      });
    }

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

    function getUsers (search) {
      User.query({'name': search, authOnly: false}, function (users) {
        $scope.newUsers = filterUsers(users, $scope.subscribers);
      });
    }


    function pageChanged () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getSubscribers(offset);
    }

    function getSubscribers (offset) {
      var params = {
        'subscriptions.service': $scope.service._id,
        limit: $scope.pagination.itemsPerPage,
        sort: 'name',
        authOnly: false
      };
      params.offset = offset || 0;
      User.query(params, function (response, headers) {
        $scope.subscribers = response;
        $scope.pagination.totalItems = headers()['x-total-count'];
        $scope.subscribersLoaded = true;
      });
    }

  }
})();
