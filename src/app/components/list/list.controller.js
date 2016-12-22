(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListCtrl', ListCtrl);

  ListCtrl.$inject = ['$scope', '$routeParams', '$location', '$uibModal', '$timeout', 'List', 'User', 'UserCheckInService', 'UserDataService', 'alertService', 'gettextCatalog'];

  function ListCtrl ($scope, $routeParams, $location, $uibModal, $timeout, List, User, UserCheckInService, UserDataService, alertService, gettextCatalog) {
    $scope.isMember = false;
    $scope.isManager = false;
    $scope.isOwner = false;
    $scope.isFavorite = false;
    $scope.datePicker = {
      opened: false
    };
    $scope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };

    function populateList () {
      var listType = [];
      listType[$scope.list.type + 's.list'] = $scope.list._id;
      $scope.$broadcast('populate-list', listType);
    }

    $scope.$on('user-service-ready', function() {
      $scope.list = List.get({'listId': $routeParams.list});
      var listCallback = function () {

        populateList();

        angular.forEach($scope.currentUser[$scope.list.type + 's'], function (val, key) {
          var listId = val.list;
          if (typeof val.list === 'object') {
            listId = val.list._id;
          }
          if (listId == $scope.list._id) {
            $scope.isMember = true;
          }
        });
        $scope.isManager = $scope.list.isManager($scope.currentUser);
        $scope.checkinUser = {
          list: $scope.list._id
        };
        $scope.isOwner = $scope.list.owner ? $scope.list.owner._id == $scope.currentUser._id : false;
        angular.forEach($scope.currentUser.favoriteLists, function (val, key) {
          if (val._id == $scope.list._id) {
            $scope.isFavorite = true;
          }
        });
      };
      $scope.list.$promise.then(listCallback);
      $scope.usersAdded = {};
    });

    // Retrieve users
    $scope.getUsers = function(search) {
      $scope.newMembers = User.query({'name': search});
    };

    // Add users to a list
    $scope.addMemberToList = function() {
      var promises = [];
      angular.forEach($scope.usersAdded.users, function (value, key) {
        UserCheckInService.save({userId: value, listType: $scope.list.type + 's'}, {list: $scope.list._id}, function (out) {
          UserDataService.notify();
        });
      });
    };

    // Remove a user from a list
    $scope.removeFromList = function (user) {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        var checkInId = 0;
        for (var i = 0, len = user[$scope.list.type + 's'].length; i < len; i++) {
          if (angular.equals($scope.list._id, user[$scope.list.type + 's'][i].list._id)) {
            checkInId = user[$scope.list.type + 's'][i]._id;
          }
        }
        if (checkInId != 0) {
          UserCheckInService.delete({userId: user._id, listType: $scope.list.type + 's', checkInId: checkInId}, {}, function(user) {
            alertService.add('success', gettextCatalog.getString('The user was successfully checked out.'));
            UserDataService.notify();
          });
        }
      });
    };


    // Check current user in this list
    $scope.checkIn = function () {
      UserCheckInService.save({userId: $scope.currentUser._id, listType: $scope.list.type + 's'}, $scope.checkinUser, function (user) {
        alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
        $scope.isMember = true;
        $scope.setCurrentUser(user);
        UserDataService.notify();
      });
    };

    // Check current user out of this list
    $scope.checkOut = function () {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        var checkInId = 0;
        for (var i = 0, len = $scope.currentUser[$scope.list.type + 's'].length; i < len; i++) {
          if (angular.equals($scope.list._id, $scope.currentUser[$scope.list.type + 's'][i].list._id)) {
            checkInId = $scope.currentUser[$scope.list.type + 's'][i]._id;
          }
        }
        if (checkInId != 0) {
          UserCheckInService.delete({userId: $scope.currentUser._id, listType: $scope.list.type + 's', checkInId: checkInId}, {}, function (user) {
            alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
            $scope.isMember = false;
            $scope.setCurrentUser(user);
            UserDataService.notify();
          });
        }
      });
    };

    // Delete list
    $scope.deleteList = function() {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.list.$delete(function (out) {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
          $location.path('/lists');
        });
      });
    };

    // Export email addresses
    // TODO: fix issue that only x first emails are exported
    $scope.exportEmails = function() {
      $scope.emailsText = '';
      $scope.$broadcast('users-export-txt', function (resp) {
        $scope.emailsText = resp.data;
        $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'exportEmailsModal.html',
          size: 'lg',
          scope: $scope,
        });
      });
    };

    $scope.exportCSV = function() {
      $scope.$broadcast('users-export-csv');
    };

    $scope.exportPDF = function() {
      $scope.$broadcast('users-export-pdf');
    };

    // Star a list as favorite
    $scope.star = function() {
      if (!$scope.currentUser.favoriteLists) {
        $scope.currentUser.favoriteLists = new Array();
      }
      $scope.currentUser.favoriteLists.push($scope.list);
      User.update($scope.currentUser, function (user) {
        alertService.add('success', gettextCatalog.getString('This list was successfully added to your favorites.'));
        $scope.isFavorite = true;
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    // Remove a list from favorites
    $scope.unstar = function() {
      $scope.currentUser.favoriteLists = $scope.currentUser.favoriteLists.filter(function (elt) {
        return elt._id != $scope.list._id;
      });
      User.update($scope.currentUser, function (user) {
        alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favorites.'));
        $scope.isFavorite = false;
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    // Approve a user and remove his pending status
    $scope.approveUser = function (user) {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        for (var i = 0, len = user[$scope.list.type + 's'].length; i < len; i++) {
          if (user[$scope.list.type + 's'][i].list == $scope.list._id) {
            user[$scope.list.type + 's'][i].pending = false;
          }
        }
        user.$update(function (out) {
          alertService.add('success', gettextCatalog.getString('The user was successfully approved.'));
        });
      });
    };

    // Promote a user to manager
    $scope.promoteManager = function (user) {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.list.managers.push(user._id);
        $scope.list.$update(function (list, response) {
          $scope.list = list;
          UserDataService.notify();
          alertService.add('success', gettextCatalog.getString('The user was successfully promoted to manager.'));
        });
      });
    };

    // Demote a user from manager role
    $scope.demoteManager = function (user) {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        var mmanagers = $scope.list.managers.filter(function (elt) {
          return elt._id != user._id;
        });
        $scope.list.managers = mmanagers;
        $scope.list.$update(function (list, response) {
          $scope.list = list;
          UserDataService.notify();
          alertService.add('success', gettextCatalog.getString('The user is not a manager anymore.'));
        });
      });
    };

    $scope.showDatePicker = function() {
      $scope.datePicker.opened = true;
    };

  }
})();
