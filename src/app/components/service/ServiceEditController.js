(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceEditController', ServiceEditController);

  ServiceEditController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'Service', 'ServiceCredentials', 'User'];

  function ServiceEditController ($exceptionHandler, $scope, $routeParams, $location, gettextCatalog, alertService, Service, ServiceCredentials, User) {
    var thisScope = $scope;

    thisScope.getMailchimpLists = getMailchimpLists;
    thisScope.getGoogleGroups = getGoogleGroups;
    thisScope.getUsers = getUsers;
    thisScope.removeManager = removeManager;
    thisScope.saveService = saveService;
    thisScope.mailchimpLists = [];
    thisScope.credentials = [];
    thisScope.newUsers = [];
    thisScope.managers = [];
    thisScope.selectedLists = [];// used by nested select lists controller
    thisScope.serviceTypes = [
      {
        value: 'mailchimp',
        label: 'Mailchimp'
      },
      {
        value: 'googlegroup',
        label: 'Google Group'
      }
    ];

    function initService () {
      thisScope.credentials = ServiceCredentials.query();

      if ($routeParams.serviceId) {
        Service.get({'serviceId': $routeParams.serviceId}, function(service) {
          thisScope.service = service;
          thisScope.selectedLists = thisScope.service.lists;
          thisScope.managers = angular.copy(thisScope.service.managers);
          if (thisScope.service.mailchimp) {
            getMailchimpLists();
            return;
          }
          if (thisScope.service.googlegroup && thisScope.service.googlegroup.domain) {
            getGoogleGroups();
          }
        });
        return;
      }

      thisScope.service = new Service();
      thisScope.service.lists = [];
    }

    initService();

    function isUserSubscribed (user, serviceId) {
      for (var i = 0; i < user.subscriptions.length; i++) {
        if (typeof user.subscriptions[i].service === 'object') {
          if (user.subscriptions[i].service._id === serviceId) {
            return true;
          }
        }

        if (user.subscriptions[i].service === serviceId) {
          return true;
        }
      }

      return false;
    }

    function subscribeManagers (service) {
      angular.forEach(thisScope.managers, function (manager) {
        if (!isUserSubscribed(manager, thisScope.service._id)) {
          service.subscribe({_id: manager._id, email: manager.email});
        }
      });
    }

    function saveSuccess (service) {
      alertService.add('success', gettextCatalog.getString('Service saved successfully'));

      if ($routeParams.serviceId) {
        subscribeManagers(service);
      } else {
        service.subscribe({_id: thisScope.currentUser._id, email: thisScope.currentUser.email});
        subscribeManagers(service);
      }

      $location.path('/services');
    }

    function saveError (error) {
      $exceptionHandler(error, 'Save service fail');
    }

    function saveService () {
      thisScope.service.lists = thisScope.selectedLists;
      thisScope.service.managers = thisScope.managers;

      if (thisScope.service._id) {
        thisScope.service.$update(saveSuccess, saveError);
        return;
      }

      thisScope.service.$save(saveSuccess, saveError);
    }

    function getMailchimpLists () {
      if(!thisScope.service.mailchimp || !thisScope.service.mailchimp.apiKey) {
        return;
      }
      Service
        .getMailchimpLists(thisScope.service.mailchimp.apiKey)
        .then(function (result) {
          thisScope.mailchimpLists = result.data.lists;
        }, function () {
          thisScope.service.mailchimp.apiKey = '';
          thisScope.mailchimpLists = [];
        });
    }

    function getGoogleGroups () {
      Service
        .getGoogleGroups(thisScope.service.googlegroup.domain)
        .then(function (result) {
          thisScope.googleGroups = result.data;
        });
    }

    function getUsers (search) {
      User.query({'name': search, authOnly: false}, function (users) {
        thisScope.newUsers = filterManagers(users);
      });
    }

    function removeManager (user) {
      thisScope.managers.splice(thisScope.managers.indexOf(user), 1);
    }

    function filterManagers (users) {
      if (!thisScope.managers.length) {
        return users;
      }

      var filteredUsers = users.filter(function (user) {
        var inManagers = thisScope.managers.filter(function (manager) {
          return manager._id === user._id;
        })[0];
        return inManagers ? false : true;
      });

      return filteredUsers;
    }

  }
})();
