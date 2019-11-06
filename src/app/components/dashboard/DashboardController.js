(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$exceptionHandler', '$rootScope', '$scope', 'alertService', 'config', 'UserListsService', 'gettextCatalog', 'Service', 'User', 'UserCheckInService', 'UserDataService'];

  function DashboardController($exceptionHandler, $rootScope, $scope, alertService, config, UserListsService, gettextCatalog, Service, User, UserCheckInService, UserDataService) {
    var thisScope = $scope;
    thisScope.subscriptions = [];
    thisScope.itemsPerPage = 5;
    thisScope.currentPage = 1;
    thisScope.userLists = UserListsService;
    thisScope.listsOwnedAndManagedLoaded = Offline.state === 'up' ? false : true;
    UserListsService.getListsForUser(thisScope.currentUser);

    var usersListsLoaded =  $rootScope.$on('usersListsLoaded', function () {
      thisScope.listsOwnedAndManagedLoaded = true;

      var listIds = [];
      angular.forEach(UserListsService.listsOwnedAndManaged, function (list) {
        listIds.push(list._id);
      });

      if (thisScope.currentUser.appMetadata && thisScope.currentUser.appMetadata.hid && thisScope.currentUser.appMetadata.hid.listsOwnedAndManaged) {
        if (!angular.equals(thisScope.currentUser.appMetadata.hid.listsOwnedAndManaged, listIds)) {
          // Get the user first to ensure no problems on update
          User.get({userId: thisScope.currentUser._id}, function (user) {
            thisScope.currentUser = user;
            thisScope.setCurrentUser(thisScope.currentUser);
            thisScope.currentUser.setAppMetaData({listsOwnedAndManaged: listIds});
            thisScope.currentUser.$update(function () {
              thisScope.setCurrentUser(thisScope.currentUser);
            }, function (error) {
              $exceptionHandler(error, 'Save lists owned and managed - update user');
            });
          }, function (error) {
            $exceptionHandler(error, 'Save lists owned and managed - get user');
          });
        }
      }
    });

    thisScope.$on('$destroy', function() {
      usersListsLoaded();
    });


    function getSubscriptions () {
      thisScope.subscriptions = thisScope.currentUser.subscriptions;
      angular.forEach(thisScope.subscriptions, function (sub) {
        if (sub.service.owner === thisScope.currentUser._id) {
          sub.isOwner = true;
        }

        angular.forEach(sub.managers, function (manager) {
          if (manager === thisScope.currentUser._id) {
            sub.service.isManager = true;
          }
        });
      });
    }
    getSubscriptions();

    thisScope.removeFavorite = function (list) {
      thisScope.currentUser.favoriteLists.splice(thisScope.currentUser.favoriteLists.indexOf(list), 1);

      User.update(thisScope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was removed from your favourites.'), false, function () {});
        thisScope.setCurrentUser(thisScope.currentUser);
      });
    };

    thisScope.leaveList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        UserCheckInService.delete({userId: thisScope.currentUser._id, listType: list.type + 's', checkInId: list.checkinId}, {}, function(user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list.'), false, function () {});
          UserListsService.listsMember.splice(UserListsService.listsMember.indexOf(list), 1);
          UserDataService.notify();
          thisScope.setCurrentUser(user);
        });
      });
    };

    thisScope.deleteList = function (list) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'), false, function () {});
          UserListsService.listsOwnedAndManaged.splice(UserListsService.listsOwnedAndManaged.indexOf(list), 1);
        });
      });
    };

    thisScope.unsubscribe = function (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.unsubscribe(thisScope.currentUser)
          .then(function (response) {
            thisScope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'), false, function () {});
          })
          .catch(function () {
            alertService.add('danger', gettextCatalog.getString('We could not unsubscribe you from this service'), false, function () {});
          });
      });
    };

    thisScope.deleteService = function (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.$delete(function () {
          alertService.add('success', gettextCatalog.getString('Service deleted successfully'), false, function () {});
        });
      });
    };

  }
})();
