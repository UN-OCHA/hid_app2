(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', 'alertService', 'config', 'gettextCatalog', 'List', 'User', 'UserCheckInService', 'UserDataService'];

  function DashboardCtrl($scope, alertService, config, gettextCatalog, List, User, UserCheckInService, UserDataService) {
    $scope.listsManager = List.query({'managers': $scope.currentUser._id});
    $scope.listsOwner = List.query({'owner': $scope.currentUser._id});

    $scope.tabsActive = false;
    $scope.activeTab = 'favorites';

    $scope.listsMember = [];
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

    $scope.removeFavorite = function (list) {
      $scope.currentUser.favoriteLists.splice($scope.currentUser.favoriteLists.indexOf(list), 1);

      User.update($scope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was removed from your favorites.'));
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    $scope.leaveList = function (list) {

      alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        var checkInId = 0;
        for (var i = 0, len = $scope.currentUser[list.type + 's'].length; i < len; i++) {
          if (angular.equals(list._id, $scope.currentUser[list.type + 's'][i].list._id)) {
            checkInId = $scope.currentUser[list.type + 's'][i]._id;
          }
        }
        if (checkInId !== 0) {
          UserCheckInService.delete({userId: $scope.currentUser._id, listType: list.type + 's', checkInId: checkInId}, {}, function() {
            alertService.add('success', gettextCatalog.getString('Successfully removed from list.'));
            $scope.listsMember.splice($scope.listsMember.indexOf(list), 1);
            UserDataService.notify();
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

    $scope.toggleTabs = function (tabName) {
      $scope.activeTab = tabName;
      $scope.tabsActive = true;
    };

  }
})();
