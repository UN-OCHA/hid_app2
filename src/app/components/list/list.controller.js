(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListCtrl', ListCtrl);

  ListCtrl.$inject = ['$scope', '$rootScope', '$routeParams', '$location', '$uibModal', '$timeout', '$localForage', 'config', 'List', 'ListDataService', 'User', 'UserCheckInService', 'UserDataService', 'alertService', 'gettextCatalog'];
  
  function ListCtrl ($scope, $rootScope, $routeParams, $location, $uibModal, $timeout, $localForage, config, List, ListDataService, User, UserCheckInService, UserDataService, alertService, gettextCatalog) {
    $scope.isMember = false;
    $scope.isManager = false;
    $scope.isOwner = false;
    $scope.isFavorite = false;
    $scope.isPending = false;
    $scope.listLoaded = false;
    $scope.savingCheckin = false;
    $scope.savingMembers = false;
    $scope.datePicker = {
      opened: false
    };
    $scope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };
    var exportEmailModal;

    function populateList () {
      var listType = [];
      listType[$scope.list.type + 's.list'] = $scope.list._id;
      $scope.$broadcast('populate-list', listType);
    }

    function checkInStatus () {
      var pending = $scope.currentUser.lists.filter(function(list) {
        return list.pending && (list.list === $scope.list._id);
      })[0];
      $scope.isPending = pending ? true : false;
    }

    $scope.$on('user-service-ready', function() {

      $scope.list = List.get({'listId': $routeParams.list});
      var listCallback = function () {
        $scope.listLoaded = true;

        if (!$scope.list.visible) {
          return;
        }
        ListDataService.setListTypeLabel($scope.list);
        populateList();
        checkInStatus();

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
      List.get({'listId': $routeParams.list}, function (list) {
        $scope.list = list;
        listCallback();
      }, function (resp) {
        // Offline fallback
        var lflists = $localForage.instance('lists');
        lflists.getItem($routeParams.list).then(function (list) {
          $scope.list = list;
          listCallback();
        });
      });
      $scope.usersAdded = {};
    });

    function isListMember (listId, user) {
      var inList = false;

      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (listId === userList.list) {
            inList = true;
            return inList;
          }
        });
      });
      return inList;
    }

    function isSelected (selectedUsers, user) {
      var userSelected = false;
      angular.forEach(selectedUsers, function(selectedUser) {
        if (user._id === selectedUser) {
          userSelected = true;
          return userSelected;
        }
      });
      return userSelected;
    }

    function filterUsers (users, selectedUsers) {
      var filteredUsers = users.filter(function (user) {
        return !isListMember($scope.list._id, user) && !isSelected(selectedUsers, user);
      });
      return filteredUsers;
    }

    // Retrieve users
    $scope.getUsers = function(search) {
      if (search) {
        User.query({'name': search}, function (users) {
          if (users) {
            $scope.newMembers = filterUsers(users, $scope.usersAdded.users);
          }
        })
      }
    };

    // Add users to a list
    $scope.addMemberToList = function() {
      $scope.savingMembers = true;
      var promises = [];
      angular.forEach($scope.usersAdded.users, function (value, key) {
        UserCheckInService.save({userId: value, listType: $scope.list.type + 's'}, {list: $scope.list._id}, function (out) {
          UserDataService.notify();
          alertService.add('success', 'Successfully added to list');
          $scope.usersAdded.users = [];
          $scope.savingMembers = false;
        }, function (error) {
          alertService.add('danger', 'There was an error adding members to the list');
          $scope.savingMembers = false;
        });
      });
    };

    // Check current user in this list
    $scope.checkIn = function () {
      $scope.savingCheckin = true;
      UserCheckInService.save({userId: $scope.currentUser._id, listType: $scope.list.type + 's'}, $scope.checkinUser, function (user) {
        var message = $scope.list.joinability === 'moderated' ? 'Your request for check-in is pending. We will get back to you soon.' : 'You were successfully checked in.';

        alertService.add('success', message);
        $scope.isMember = true;
        $scope.setCurrentUser(user);
        checkInStatus();
        UserDataService.notify();
        $scope.savingCheckin = false;
      });
    };

    // Check current user out of this list
    $scope.checkOut = function () {
      $scope.savingCheckin = true;
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        var checkInId = 0;
        for (var i = 0, len = $scope.currentUser[$scope.list.type + 's'].length; i < len; i++) {
          if (angular.equals($scope.list._id, $scope.currentUser[$scope.list.type + 's'][i].list)) {
            checkInId = $scope.currentUser[$scope.list.type + 's'][i]._id;
          }
        }
        if (checkInId !== 0) {
          UserCheckInService.delete({userId: $scope.currentUser._id, listType: $scope.list.type + 's', checkInId: checkInId}, {}, function (user) {
            alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
            $scope.isMember = false;
            $scope.setCurrentUser(user);
            UserDataService.notify();
            $scope.savingCheckin = false;
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

    // Star a list as favorite
    $scope.star = function() {
      if (!$scope.currentUser.favoriteLists) {
        $scope.currentUser.favoriteLists = new Array();
      }
      $scope.currentUser.favoriteLists.push($scope.list);
      User.update($scope.currentUser, function (user) {
        alertService.add('success', gettextCatalog.getString('This list was successfully added to your favourites.'));
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
        alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favourites.'));
        $scope.isFavorite = false;
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    // Approve a user and remove their pending status
    $scope.approveUser = function (user) {
      var checkInId;

      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        angular.forEach(user[$scope.list.type + 's'], function (list) {
          if ($scope.list._id === list.list) {
            checkInId = list._id;
          }
        });

        if (checkInId) {
          UserCheckInService.update({userId: user._id, listType: $scope.list.type + 's', checkInId: checkInId}, {pending: false}, function () {
            alertService.add('success', gettextCatalog.getString('The user was successfully approved.'));
            user.pending = false;
          });
        }
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
