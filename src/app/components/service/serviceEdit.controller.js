(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServiceEditCtrl', ServiceEditCtrl);

  ServiceEditCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'Service', 'ServiceCredentials', 'User'];

  function ServiceEditCtrl ($exceptionHandler, $scope, $routeParams, $location, gettextCatalog, alertService, Service, ServiceCredentials, User) {
    $scope.getMailchimpLists = getMailchimpLists;
    $scope.getGoogleGroups = getGoogleGroups;
    $scope.getUsers = getUsers;
    $scope.removeManager = removeManager;
    $scope.saveService = saveService;
    $scope.mailchimpLists = [];
    $scope.credentials = [];
    $scope.newUsers = [];
    $scope.managers = [];
    $scope.selectedLists = [];// used by nested select lists controller
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

    function initService () {
      $scope.credentials = ServiceCredentials.query();

      if ($routeParams.serviceId) {
        Service.get({'serviceId': $routeParams.serviceId}, function(service) {
          $scope.service = service;
          $scope.selectedLists = $scope.service.lists;
          $scope.managers = angular.copy($scope.service.managers);
          if ($scope.service.mailchimp) {
            getMailchimpLists();
            return;
          }
          if ($scope.service.googlegroup && $scope.service.googlegroup.domain) {
            getGoogleGroups();
          }
        });
        return;
      }
    
      $scope.service = new Service();
      $scope.service.lists = [];    
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
      angular.forEach($scope.managers, function (manager) {
        if (!isUserSubscribed(manager, $scope.service._id)) {
          service.subscribe({_id: manager._id, email: manager.email});
        }
      });
    }

    function saveSuccess (service) {
      alertService.add('success', gettextCatalog.getString('Service saved successfully'));

      if ($routeParams.serviceId) {
        subscribeManagers(service);
      } else {
        service.subscribe({_id: $scope.currentUser._id, email: $scope.currentUser.email});
        subscribeManagers(service);
      }

      $location.path('/services');
    }

    function saveError (error) {
      alertService.add('danger', gettextCatalog.getString('There was an error saving this service'));
      $exceptionHandler(error, 'Save service fail');
    }

    function saveService () {
      $scope.service.lists = $scope.selectedLists;
      $scope.service.managers = $scope.managers;
     
      if ($scope.service._id) {
        $scope.service.$update(saveSuccess, saveError);
        return;
      }
     
      $scope.service.$save(saveSuccess, saveError);
    }

    function getMailchimpLists () {
      if(!$scope.service.mailchimp || !$scope.service.mailchimp.apiKey) {
        return;
      }
      Service
        .getMailchimpLists($scope.service.mailchimp.apiKey)
        .then(function (result) {
          $scope.mailchimpLists = result.data.lists;          
        }, function () {
          alertService.add('danger', gettextCatalog.getString('Invalid API key'));
          $scope.service.mailchimp.apiKey = '';
          $scope.mailchimpLists = [];
        });
    }

    function getGoogleGroups () {
      Service
        .getGoogleGroups($scope.service.googlegroup.domain)
        .then(function (result) {
          $scope.googleGroups = result.data;
        });
    }

    function getUsers (search) {
      User.query({'name': search, 'appMetadata.hid.login': true}, function (users) {
        $scope.newUsers = filterManagers(users);
      });
    }

    function removeManager (user) {
      $scope.managers.splice($scope.managers.indexOf(user), 1);
    }

    function filterManagers (users) {
      if (!$scope.managers.length) {
        return users;
      }

      var filteredUsers = users.filter(function (user) {
        var inManagers = $scope.managers.filter(function (manager) {
          return manager._id === user._id;
        })[0];
        return inManagers ? false : true;
      });
      
      return filteredUsers;
    }

  }
})();
