(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListCtrl', ListCtrl);

  ListCtrl.$inject = ['$scope', '$routeParams', '$location', '$localForage', 'config', 'List', 'ListDataService', 'User', 'UserCheckInService', 'UserDataService', 'alertService', 'gettextCatalog'];

  function ListCtrl ($scope, $routeParams, $location, $localForage, config, List, ListDataService, User, UserCheckInService, UserDataService, alertService, gettextCatalog) {
    $scope.isMember = false;
    $scope.isManager = false;
    $scope.isOwner = false;
    $scope.isFavorite = false;
    $scope.isPending = false;
    $scope.listLoaded = false;
    $scope.savingCheckin = false;
    $scope.savingMembers = false;
    $scope.usersAdded = {};
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

    function checkInStatus () {
      var pending = $scope.currentUser.lists.filter(function(list) {
        return list.pending && (list.list === $scope.list._id);
      })[0];
      $scope.isPending = pending ? true : false;
    }

    function isMember (user, list) {
      var isMember = false;
      angular.forEach(user[list.type + 's'], function (val) {
        var listId = typeof val.list === 'object' ? val.list._id : val.list;
        if (listId === list._id) {
          isMember = true;
        }
      });
      return isMember;
    }

    function isFavorite (user, list) {
      var isFavorite = false;
      angular.forEach(user.favoriteLists, function (val) {
        if (val._id == list._id) {
          isFavorite = true;
        }
      });
      return isFavorite;
    }

    var setUpList = function () {
      $scope.listLoaded = true;

      if (!$scope.list.visible) {
        return;
      }
      ListDataService.setListTypeLabel($scope.list);
      populateList();
      checkInStatus();
      $scope.isMember = isMember($scope.currentUser, $scope.list);
      $scope.isManager = $scope.list.isManager($scope.currentUser);
      $scope.isOwner = $scope.list.owner ? $scope.list.owner._id == $scope.currentUser._id : false;
      $scope.isFavorite = isFavorite($scope.currentUser, $scope.list);
      $scope.checkinUser = {
        list: $scope.list._id
      };
    };

    $scope.$on('user-service-ready', function() {

      List.get({'listId': $routeParams.list}, function (list) {
        $scope.list = list;
        setUpList();
      }, function () {
        // Offline fallback
        var lflists = $localForage.instance('lists');
        lflists.getItem($routeParams.list).then(function (list) {
          $scope.list = list;
          setUpList();
        });
      });

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
        User.query({'name': search, 'appMetadata.hid.login': true}, function (users) {
          if (users) {
            $scope.newMembers = filterUsers(users, $scope.usersAdded.users);
          }
        });
      }
    };

    // Add users to a list
    $scope.addMemberToList = function() {
      $scope.savingMembers = true;
      angular.forEach($scope.usersAdded.users, function (value) {
        UserCheckInService.save({userId: value, listType: $scope.list.type + 's'}, {list: $scope.list._id}, function () {
          UserDataService.notify();
          alertService.add('success', gettextCatalog.getString('Successfully added to list'));
          $scope.usersAdded.users = [];
          $scope.savingMembers = false;
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error adding members to the list'));
          $scope.savingMembers = false;
        });
      });
    };

    // Delete list
    $scope.deleteList = function() {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        $scope.list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
          $location.path('/lists');
        });
      });
    };

    // Star a list as favorite
    $scope.star = function() {
      if (!$scope.currentUser.favoriteLists) {
        $scope.currentUser.favoriteLists = [];
      }
      $scope.currentUser.favoriteLists.push($scope.list);
      User.update($scope.currentUser, function () {
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
      User.update($scope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favourites.'));
        $scope.isFavorite = false;
        $scope.setCurrentUser($scope.currentUser);
      });
    };

    // Approve a user and remove their pending status
    $scope.approveUser = function (user) {
      var checkInId;

      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
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

    $scope.showDatePicker = function() {
      $scope.datePicker.opened = true;
    };

  }
})();
