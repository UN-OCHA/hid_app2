(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListController', ListController);

  ListController.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$routeParams', '$location', '$localForage', 'config', 'List', 'ListDataService', 'User', 'UserCheckInService', 'UserDataService', 'Service', 'alertService', 'gettextCatalog'];

  function ListController ($exceptionHandler, $rootScope, $scope, $routeParams, $location, $localForage, config, List, ListDataService, User, UserCheckInService, UserDataService, Service, alertService, gettextCatalog) {
    var thisScope = $scope;
    thisScope.isMember = false;
    thisScope.isManager = false;
    thisScope.isOwner = false;
    thisScope.isFavorite = false;
    thisScope.isPending = false;
    thisScope.listLoaded = false;
    thisScope.savingCheckin = false;
    thisScope.savingMembers = false;
    thisScope.listUnavailable = false;
    thisScope.offline = false;
    thisScope.favSaving = false;
    thisScope.usersAdded = {};
    thisScope.datePicker = {
      opened: false
    };
    thisScope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };

    function populateList () {
      var listType = [];
      listType[thisScope.list.type + 's.list'] = thisScope.list._id;
      thisScope.$broadcast('populate-list', listType);
    }

    function checkInStatus () {
      var pending = thisScope.currentUser.lists.filter(function(list) {
        return list.pending && (list.list === thisScope.list._id);
      })[0];
      thisScope.isPending = pending ? true : false;
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
      thisScope.listLoaded = true;

      if (!thisScope.list.visible) {
        return;
      }
      ListDataService.setListTypeLabel(thisScope.list);
      populateList();
      checkInStatus();
      thisScope.isMember = isMember(thisScope.currentUser, thisScope.list);
      thisScope.isManager = thisScope.list.fromCache ? false : thisScope.list.isManager(thisScope.currentUser);
      thisScope.isOwner = thisScope.list.owner ? thisScope.list.owner._id == thisScope.currentUser._id : false;
      thisScope.isFavorite = isFavorite(thisScope.currentUser, thisScope.list);
      thisScope.checkinUser = {
        list: thisScope.list._id
      };
    };

    thisScope.$on('user-service-ready', function() {
      var listId = $routeParams.list;
      var lflists = $localForage.instance('lists');
      // Try to load from cache first
      lflists.getItem(listId)
      .then(function (list) {
        if (list) {
          thisScope.list = list;
          thisScope.list.fromCache = true;
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
          thisScope.list = list;
          thisScope.list.fromCache = false;
          $rootScope.title = list.name;
          setUpList();
        }
      })
      .catch(function (err) {
        thisScope.listLoaded = true;
        thisScope.listUnavailable = true;
        thisScope.offline = Offline.state === 'up' ? false : true;
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
        return !isListMember(thisScope.list._id, user) && !isSelected(selectedUsers, user);
      });
      return filteredUsers;
    }

    // Retrieve users
    thisScope.getUsers = function(search) {
      if (search) {
        User.query({'q': search, authOnly: false}, function (users) {
          if (users) {
            thisScope.newMembers = filterUsers(users, thisScope.usersAdded.users);
          }
        });
      }
    };

    // Add users to a list
    thisScope.addMemberToList = function() {
      thisScope.savingMembers = true;
      angular.forEach(thisScope.usersAdded.users, function (value) {
        UserCheckInService.save({userId: value, listType: thisScope.list.type + 's'}, {list: thisScope.list._id}, function () {
          UserDataService.notify();
          alertService.add('success', gettextCatalog.getString('Successfully added to list'));
          thisScope.usersAdded.users = [];
          thisScope.savingMembers = false;
        }, function (error) {
          $exceptionHandler(error, 'Removing duplicate');
          thisScope.savingMembers = false;
        });
      });
    };

    // Check current user in list
    thisScope.checkIn = function () {
      UserCheckInService.save({userId: thisScope.currentUser._id, listType: thisScope.list.type + 's'}, {list: thisScope.list._id}, function (user) {
        Service.getSuggestions(thisScope.list._id, thisScope.currentUser).$promise.then(function () {
          if (Service.suggestedServices.length) {
            $location.path('services/suggestions').search({lists: thisScope.list._id });
            return;
          }

          alertService.add('success', gettextCatalog.getString('You were successfully checked into the list'));
          thisScope.setCurrentUser(user);
          UserDataService.notify();
          thisScope.isMember = true;
        });
      }, function (error) {
        $exceptionHandler(error, 'Removing duplicate');
      });
    };

    // Check current user out of the list
    thisScope.checkOut = function () {
      var checkIn = null;
      angular.forEach(thisScope.currentUser[thisScope.list.type + 's'], function (val) {
        var listId = typeof val.list === 'object' ? val.list._id : val.list;
        if (listId === thisScope.list._id) {
          checkIn = val;
        }
      });
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        UserCheckInService.delete({userId: thisScope.currentUser._id, listType: thisScope.list.type + 's', checkInId: checkIn._id}, {}, function (user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list'), false, function(){});
          thisScope.setCurrentUser(user);
          UserDataService.notify();
          thisScope.isMember = false;
        }, function (error) {
          $exceptionHandler(error, 'Leaving list');
        });
      });
    };

    // Delete list
    thisScope.deleteList = function() {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        thisScope.list.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
          $location.path('/lists');
        });
      });
    };

    function favoriteList () {
      if (!thisScope.currentUser.favoriteLists) {
        thisScope.currentUser.favoriteLists = [];
      }
      thisScope.currentUser.favoriteLists.push(thisScope.list);
      User.update(thisScope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was successfully added to your favourites.'));
        thisScope.isFavorite = true;
        thisScope.setCurrentUser(thisScope.currentUser);
        thisScope.favSaving = false;
      }, function (error) {
        thisScope.favSaving = false;
        $exceptionHandler(error, 'Favourite list - update user');
      });
    }

    function unfavoriteList () {
      thisScope.currentUser.favoriteLists = thisScope.currentUser.favoriteLists.filter(function (elt) {
        return elt._id != thisScope.list._id;
      });
      User.update(thisScope.currentUser, function () {
        alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favourites.'));
        thisScope.isFavorite = false;
        thisScope.setCurrentUser(thisScope.currentUser);
        thisScope.favSaving = false;
      }, function (error) {
        thisScope.favSaving = false;
        $exceptionHandler(error, 'Unfavourite list - update user');
      });
    }

    // Star a list as favorite
    thisScope.star = function() {
      thisScope.favSaving = true;
      User.get({userId: thisScope.currentUser._id}, function (user) {
        thisScope.currentUser = user;
        thisScope.setCurrentUser(thisScope.currentUser);
        favoriteList();
      }, function (error) {
        thisScope.favSaving = false;
        $exceptionHandler(error, 'Favourite list - get user');
      });
    };

    // Remove a list from favorites
    thisScope.unstar = function() {
      thisScope.favSaving = true;
      User.get({userId: thisScope.currentUser._id}, function (user) {
        thisScope.currentUser = user;
        thisScope.setCurrentUser(thisScope.currentUser);
        unfavoriteList();
      }, function (error) {
        thisScope.favSaving = false;
        $exceptionHandler(error, 'Unfavourite list - get user');
      });
    };

    // Approve a user and remove their pending status
    thisScope.approveUser = function (user) {
      var checkInId;

      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        angular.forEach(user[thisScope.list.type + 's'], function (list) {
          if (thisScope.list._id === list.list) {
            checkInId = list._id;
          }
        });

        if (checkInId) {
          UserCheckInService.update({userId: user._id, listType: thisScope.list.type + 's', checkInId: checkInId}, {pending: false}, function () {
            alertService.add('success', gettextCatalog.getString('The user was successfully approved.'));
            user.pending = false;
          });
        }
      });
    };

    thisScope.showDatePicker = function() {
      thisScope.datePicker.opened = true;
    };

  }
})();
