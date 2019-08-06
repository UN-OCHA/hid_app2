(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListController', ListController);

  ListController.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$routeParams', '$location', '$localForage', 'config', 'List', 'ListDataService', 'User', 'UserCheckInService', 'UserDataService', 'Service', 'alertService', 'gettextCatalog'];

  function ListController ($exceptionHandler, $rootScope, $scope, $routeParams, $location, $localForage, config, List, ListDataService, User, UserCheckInService, UserDataService, Service, alertService, gettextCatalog) {
    $scope.isMember = false;
    $scope.isManager = false;
    $scope.isOwner = false;
    $scope.isFavorite = false;
    $scope.isPending = false;
    $scope.listLoaded = false;
    $scope.savingCheckin = false;
    $scope.savingMembers = false;
    $scope.listUnavailable = false;
    $scope.offline = false;
    $scope.favSaving = false;
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
      $scope.isManager = $scope.list.fromCache ? false : $scope.list.isManager($scope.currentUser);
      $scope.isOwner = $scope.list.owner ? $scope.list.owner._id == $scope.currentUser._id : false;
      $scope.isFavorite = isFavorite($scope.currentUser, $scope.list);
      $scope.checkinUser = {
        list: $scope.list._id
      };
    };

    $scope.$on('user-service-ready', function() {
      var listId = $routeParams.list;
      var lflists = $localForage.instance('lists');
      // Try to load from cache first
      lflists.getItem(listId)
      .then(function (list) {
        if (list) {
          $scope.list = list;
          $scope.list.fromCache = true;
          setUpList();
        }
        if ($rootScope.isOnline) {
          return List.get({'listId': listId}).$promise;
        }
      })
      .then(function (list) {
        // Then load from server
        if ($rootScope.isOnline) {
          lflists.setItem(listId, list);
          $scope.list = list;
          $scope.list.fromCache = false;
          $rootScope.title = list.name;
          setUpList();
        }
      })
      .catch(function (err) {
        $scope.listLoaded = true;
        $scope.listUnavailable = true;
        $scope.offline = Offline.state === 'up' ? false : true;
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
        User.query({'q': search, authOnly: false}, function (users) {
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
        }, function (error) {
          $exceptionHandler(error, 'Removing duplicate');
          $scope.savingMembers = false;
        });
      });
    };

    // Check current user in list
    $scope.checkIn = function () {
      UserCheckInService.save({userId: $scope.currentUser._id, listType: $scope.list.type + 's'}, {list: $scope.list._id}, function (user) {
        Service.getSuggestions($scope.list._id, $scope.currentUser).$promise.then(function () {
          if (Service.suggestedServices.length) {
            $location.path('services/suggestions').search({lists: $scope.list._id });
            return;
          }

          alertService.add('success', gettextCatalog.getString('You were successfully checked into the list'));
          $scope.setCurrentUser(user);
          UserDataService.notify();
          $scope.isMember = true;
        });
      }, function (error) {
        $exceptionHandler(error, 'Removing duplicate');
      });
    };

    // Check current user out of the list
    $scope.checkOut = function () {
      var checkIn = null;
      angular.forEach($scope.currentUser[$scope.list.type + 's'], function (val) {
        var listId = typeof val.list === 'object' ? val.list._id : val.list;
        if (listId === $scope.list._id) {
          checkIn = val;
        }
      });
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        UserCheckInService.delete({userId: $scope.currentUser._id, listType: $scope.list.type + 's', checkInId: checkIn._id}, {}, function (user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list'), false, function(){});
          $scope.setCurrentUser(user);
          UserDataService.notify();
          $scope.isMember = false;
        }, function (error) {
          $exceptionHandler(error, 'Leaving list');
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

    function favoriteList () {
      if (!$scope.currentUser.favoriteLists) {
        $scope.currentUser.favoriteLists = [];
      }
      $scope.currentUser.favoriteLists.push($scope.list);
      User.update($scope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was successfully added to your favourites.'));
        $scope.isFavorite = true;
        $scope.setCurrentUser($scope.currentUser);
        $scope.favSaving = false;
      }, function (error) {
        $scope.favSaving = false;
        $exceptionHandler(error, 'Favourite list - update user');
      });
    }

    function unfavoriteList () {
      $scope.currentUser.favoriteLists = $scope.currentUser.favoriteLists.filter(function (elt) {
        return elt._id != $scope.list._id;
      });
      User.update($scope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favourites.'));
        $scope.isFavorite = false;
        $scope.setCurrentUser($scope.currentUser);
        $scope.favSaving = false;
      }, function (error) {
        $scope.favSaving = false;
        $exceptionHandler(error, 'Unfavourite list - update user');
      });
    }

    // Star a list as favorite
    $scope.star = function() {
      $scope.favSaving = true;
      User.get({userId: $scope.currentUser._id}, function (user) {
        $scope.currentUser = user;
        $scope.setCurrentUser($scope.currentUser);
        favoriteList();
      }, function (error) {
        $scope.favSaving = false;
        $exceptionHandler(error, 'Favourite list - get user');
      });
    };

    // Remove a list from favorites
    $scope.unstar = function() {
      $scope.favSaving = true;
      User.get({userId: $scope.currentUser._id}, function (user) {
        $scope.currentUser = user;
        $scope.setCurrentUser($scope.currentUser);
        unfavoriteList();
      }, function (error) {
        $scope.favSaving = false;
        $exceptionHandler(error, 'Unfavourite list - get user');
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
