(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$exceptionHandler', '$rootScope', '$scope', 'alertService', 'config', 'UserListsService', 'gettextCatalog', 'Service', 'User', 'UserCheckInService', 'UserDataService'];

  function DashboardCtrl($exceptionHandler, $rootScope, $scope, alertService, config, UserListsService, gettextCatalog, Service, User, UserCheckInService, UserDataService) {
    $scope.subscriptions = [];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.userLists = UserListsService;
    $scope.listsOwnedAndManagedLoaded = Offline.state === 'up' ? false : true;
    UserListsService.getListsForUser($scope.currentUser);

    var usersListsLoaded =  $rootScope.$on('usersListsLoaded', function () {
      $scope.listsOwnedAndManagedLoaded = true;

      var listIds = [];
      angular.forEach(UserListsService.listsOwnedAndManaged, function (list) {
        listIds.push(list._id);
      });

      if ($scope.currentUser.appMetadata && $scope.currentUser.appMetadata.hid && $scope.currentUser.appMetadata.hid.listsOwnedAndManaged) {
        if (!angular.equals($scope.currentUser.appMetadata.hid.listsOwnedAndManaged, listIds)) {
          // Get the user first to ensure no problems on update
          User.get({userId: $scope.currentUser._id}, function (user) {
            $scope.currentUser = user;
            $scope.setCurrentUser($scope.currentUser);
            $scope.currentUser.setAppMetaData({listsOwnedAndManaged: listIds});
            $scope.currentUser.$update(function () {
              $scope.setCurrentUser($scope.currentUser);
            }, function (error) {
              $exceptionHandler(error, 'Save lists owned and managed - update user');
            });
          }, function (error) {
            $exceptionHandler(error, 'Save lists owned and managed - get user');
          });
        }
      }
    });

    $scope.$on('$destroy', function() {
      usersListsLoaded();
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
          UserListsService.listsMember.splice(UserListsService.listsMember.indexOf(list), 1);
          UserDataService.notify();
          $scope.setCurrentUser(user);
        });
      });
    };

    $scope.deleteList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'), false, function () {});
          UserListsService.listsOwnedAndManaged.splice(UserListsService.listsOwnedAndManaged.indexOf(list), 1);
        });
      });
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
