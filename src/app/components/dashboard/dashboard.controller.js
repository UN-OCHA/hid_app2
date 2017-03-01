(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$rootScope', '$scope', 'alertService', 'config', 'UserListsService', 'gettextCatalog', 'Service', 'User', 'UserCheckInService', 'UserDataService'];

  function DashboardCtrl($rootScope, $scope, alertService, config, UserListsService, gettextCatalog, Service, User, UserCheckInService, UserDataService) {
    $scope.tabs = {};
    $scope.activeTab = 'favorites';
    $scope.subscriptions = [];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;

    UserListsService.getListsForUser($scope.currentUser);
    $scope.favoriteLists = UserListsService.favoriteLists;
    $scope.listsMember = UserListsService.listsMember;
    $scope.listsOwnedAndManaged = UserListsService.listsOwnedAndManaged;
    $scope.listsOwnedAndManagedLoaded = Offline.status === 'up' ? false : true;
    
    $rootScope.$on('usersListsLoaded', function () {
      $scope.listsOwnedAndManagedLoaded = true;
    });

    function getSubscriptions () {
      $scope.subscriptions = $scope.currentUser.subscriptions;
      angular.forEach($scope.subscriptions, function (sub) {
        if (sub.service.owner === $scope.currentUser._id) {
          sub.isOwner = true;
        }

        angular.forEach(sub.managers, function (manager) {
          if (manager === $scope.currentUser._id) {
            sub.service.isManager = true;
          }
        });
      });
    }
    getSubscriptions();

    $scope.removeFavorite = function (list) {
      $scope.currentUser.favoriteLists.splice($scope.currentUser.favoriteLists.indexOf(list), 1);

      User.update($scope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was removed from your favourites.'), false, function () {});
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    $scope.leaveList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        UserCheckInService.delete({userId: $scope.currentUser._id, listType: list.type + 's', checkInId: list.checkinId}, {}, function(user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list.'), false, function () {});
          $scope.listsMember.splice($scope.listsMember.indexOf(list), 1);
          UserDataService.notify();
          $scope.setCurrentUser(user);
        });
      });
    };

    $scope.deleteList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'), false, function () {});
          $scope.listsOwnedAndManaged.splice($scope.listsOwnedAndManaged.indexOf(list), 1);
        });
      });
    };

    $scope.toggleTabs = function(tabName) {
      $scope.tabs[tabName] = !$scope.tabs[tabName];
      $scope.activeTab = tabName;
    };

    $scope.tabClass = function (tabName) {
      var classes = [];
      if ($scope.tabs[tabName]) {
        classes.push('mobile-active');
      }
      if ($scope.activeTab === tabName) {
        classes.push('desktop-active');
      }
      return classes;
    };

    $scope.unsubscribe = function (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.unsubscribe($scope.currentUser)
          .then(function (response) {
            $scope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'), false, function () {});
          })
          .catch(function () {
            alertService.add('danger', gettextCatalog.getString('We could not unsubscribe you from this service'), false, function () {});
          });
      });
    };

    $scope.deleteService = function (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'), false, function () {});
        });
      });
    };

  }
})();
