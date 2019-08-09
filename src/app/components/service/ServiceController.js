(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceController', ServiceController);

  ServiceController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'Service', 'User'];

  function ServiceController ($exceptionHandler, $scope, $routeParams, $location, gettextCatalog, alertService, Service, User) {
    var thisScope = $scope;

    thisScope.isSubscribed = false;
    thisScope.userSubscribed = {};
    thisScope.subscribers = [];
    thisScope.subscribersLoaded = false;
    thisScope.subscribe = subscribe;
    thisScope.unsubscribe = unsubscribe;
    thisScope.getUsers = getUsers;
    thisScope.deleteService = deleteService;
    thisScope.pageChanged = pageChanged;
    thisScope.pagination = {
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
        thisScope.service = service;
        getSubscribers();
        thisScope.isSubscribed = isUserSubscribed(thisScope.currentUser, thisScope.service._id);
      });
    }
    initService();

    function subscribe (user) {
      thisScope.service.subscribe(user)
        .then(function(response) {
          if (user._id === thisScope.currentUser._id) {
            thisScope.setCurrentUser(response.data);
            thisScope.isSubscribed = true;
            alertService.add('success', gettextCatalog.getString('You were successfully subscribed to this service'));
          }
          else {
            alertService.add('success', gettextCatalog.getString('The user was successfully subscribed to this service'));
          }
          thisScope.newUsers = [];
          thisScope.subscribers.push(user);
        })
        .catch(function (error) {
          $exceptionHandler(error, 'Subscribe fail');
        });
    }

    function unsubscribe (user) {
      thisScope.service.unsubscribe(user)
        .then(function (response) {
          if (user._id == thisScope.currentUser._id) {
            thisScope.setCurrentUser(response.data);
            thisScope.isSubscribed = false;
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'));
          }
          else {
            alertService.add('success', gettextCatalog.getString('The user was successfully unsubscribed from this service'));
          }

          thisScope.subscribers.splice(thisScope.subscribers.indexOf(user), 1);
        })
        .catch(function (error) {
          $exceptionHandler(error, 'Unsubscribe fail');
        });
    }

    function deleteService () {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        thisScope.service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
          $location.path('/services');
        });
      });
    }

    function filterUsers (users, subscribers) {
      if (!subscribers.length) {
        return users;
      }
      var serviceId = thisScope.service._id;
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
        thisScope.newUsers = filterUsers(users, thisScope.subscribers);
      });
    }


    function pageChanged () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getSubscribers(offset);
    }

    function getSubscribers (offset) {
      var params = {
        'subscriptions.service': thisScope.service._id,
        limit: thisScope.pagination.itemsPerPage,
        sort: 'name',
        authOnly: false
      };
      params.offset = offset || 0;
      User.query(params, function (response, headers) {
        thisScope.subscribers = response;
        thisScope.pagination.totalItems = headers()['x-total-count'];
        thisScope.subscribersLoaded = true;
      });
    }

  }
})();
