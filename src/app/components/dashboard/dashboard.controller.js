(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', 'alertService', 'config', 'gettextCatalog', 'List', 'ListDataService', 'Service', 'User', 'UserCheckInService', 'UserDataService'];

  function DashboardCtrl($scope, alertService, config, gettextCatalog, List, ListDataService, Service, User, UserCheckInService, UserDataService) {
    $scope.tabs = {};
    $scope.activeTab = 'favorites';
    $scope.listsMember = [];
    $scope.listsOwnedOrManaged = [];
    $scope.subscriptions = [];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;

    ListDataService.getManagedAndOwnedLists($scope.currentUser, '', function (lists) {
      $scope.listsOwnedOrManaged = lists;
    });

    angular.forEach(config.listTypes, function (listType) {
      angular.forEach($scope.currentUser[listType + 's'], function (val) {
        var listId = val.list;
        if (typeof val.list === "object") {
          listId = val.list._id;
        }
        var tmpList = List.get({listId: listId}, function () {
          $scope.listsMember.push(tmpList);
        });
      });
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
        alertService.add('success', gettextCatalog.getString('This list was removed from your favorites.'));
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    $scope.leaveList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        var checkInId;
        angular.forEach($scope.currentUser[list.type + 's'], function (userList) {
          if (list._id === userList.list) {
            checkInId = userList._id;
          }
        });
        if (checkInId) {
          UserCheckInService.delete({userId: $scope.currentUser._id, listType: list.type + 's', checkInId: checkInId}, {}, function(user) {
            alertService.add('success', gettextCatalog.getString('Successfully removed from list.'));
            $scope.listsMember.splice($scope.listsMember.indexOf(list), 1);
            UserDataService.notify();
            $scope.setCurrentUser(user);
          });
        }
      });
    };

    $scope.deleteList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
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
      alertService.add('warning', 'Are you sure?', true, function() {
        service.unsubscribe($scope.currentUser)
          .then(function (response) {
            $scope.setCurrentUser(response.data);
            alertService.add('success','You were successfully unsubscribed from this service');
          })
          .catch(function () {
            alertService.add('danger', 'We could not unsubscribe you from this service');
          });
      });
    };

    $scope.deleteService = function (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'));
        });
      });
    };

  }
})();
