var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$resource', 'config',
  function ($resource, config) {
    var List = $resource(config.apiUrl + 'list/:listId', {listId: '@_id'}, 
    {
      'update': {
        method: 'PUT'
      }
    });

    // Is a user manager of a list ?
    List.prototype.isManager = function (user) {
      var out = false;
      angular.forEach(this.managers, function (val, key) {
        if (angular.equals(user._id, val._id)) {
          out = true;
        }
      });
      return out;
    };

    return List;
  }
]);

listServices.factory('listService', ['$rootScope', 'List',
  function ($rootScope, List) {
    var filters = {}, lists = {}, request = {};

    return {
      addFilter: function(key, val, notify) {
        filters[key] = val;
        if (notify) this.notify();
      },

      setFilters: function(filters2, notify) {
        filters = filters2;
        if (notify) this.notify();
      },

      setRequest: function (req, notify) {
        request = req;
        if (notify) this.notify();
      },

      removeFilter: function(key, notify) {
        delete filters[key];
        if (notify) this.notify();
      },

      filter: function(cb) {
        var trequest = angular.copy(request);
        lists.length = 0;
        angular.merge(trequest, filters);
        lists = List.query(trequest, cb);
      },

      getLists: function() {
        return lists;
      },

      subscribe: function(scope, callback) {
        var handler = $rootScope.$on('lists-updated-event', callback);
        scope.$on('$destroy', handler);
      },

      notify: function () {
        $rootScope.$emit('lists-updated-event');
      }
    };
  }
]);


var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'User', 'UserCheckIn', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, $uibModal, List, User, UserCheckIn, alertService, gettextCatalog) {
  $scope.isMember = false;
  $scope.isManager = false;
  $scope.isOwner = false;
  $scope.isFavorite = false;

  $scope.list = List.get({'listId': $routeParams.list}, function () {
    $scope.pageChanged();
    $scope.setAdminAvailable(true);
    angular.forEach($scope.currentUser[$scope.list.type + 's'], function (val, key) {
      if (val.list == $scope.list._id) {
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
  });
  $scope.usersAdded = {};

  // Retrieve users
  $scope.getUsers = function(search) {
    $scope.newMembers = User.query({'name': search});
  };

  // Retrieve managers
  $scope.getManagers = function(search) {
    $scope.newManagers = User.query({'name': search});
  };

  // Add users to a list
  $scope.addMemberToList = function() {
    var promises = [];
    angular.forEach($scope.usersAdded.users, function (value, key) {
      UserCheckIn.save({userId: value, listType: $scope.list.type + 's'}, {list: $scope.list._id}, function (out) {
        $scope.pageChanged();
      });
    });
  };

  // Remove a user from a list
  $scope.removeFromList = function (user) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      user[$scope.list.type + 's'] = user[$scope.list.type + 's'].filter(function (elt) {
        return elt.list != $scope.list._id;
      });
      user.$update(function(out) {
        // Close existing alert
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user was successfully removed.'));
        $scope.pageChanged();
      });
    });
  };


  // Check current user in this list
  $scope.checkIn = function () {
    UserCheckIn.save({userId: $scope.currentUser._id, listType: $scope.list.type + 's'}, $scope.checkinUser, function (user) {
      alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
      $scope.isMember = true;
      $scope.setCurrentUser(user);
      $scope.pageChanged();
    });
  };

  // Check current user out of this list
  $scope.checkOut = function () {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      var checkInId = 0;
      console.log($scope.currentUser);
      for (var i = 0, len = $scope.currentUser[$scope.list.type + 's'].length; i < len; i++) {
        console.log($scope.list._id);
        console.log($scope.currentUser[$scope.list.type + 's'][i].list);
        if (angular.equals($scope.list._id, $scope.currentUser[$scope.list.type + 's'][i].list)) {
          console.log('equals');
          checkInId = $scope.currentUser[$scope.list.type + 's'][i]._id;
        }
      }
      console.log(checkInId);
      if (checkInId != 0) {
        UserCheckIn.delete({userId: $scope.currentUser._id, listType: $scope.list.type + 's', checkInId: checkInId}, {}, function (user) {
          // Close existing alert
          alert.closeConfirm();
          alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
          $scope.isMember = false;
          $scope.setCurrentUser(user);
          $scope.pageChanged();
        });
      }
    });
  };

  // Delete list
  $scope.deleteList = function() {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      $scope.list.$delete(function (out) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
        $location.path('/lists');
      });
    });
  };

  // Export email addresses
  $scope.exportEmails = function() {
    $scope.emailsText = '';
    for (var i = 0, len = $scope.users.length; i < len; i++) {
      $scope.emailsText += $scope.users[i].name + ' <' + $scope.users[i].email + '>';
      if (i != len - 1) {
        $scope.emailsText += ', ';
      }
    }
    $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'exportEmailsModal.html',
      size: 'lg',
      scope: $scope,
    });
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
        alert.closeConfirm();
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
        $scope.pageChanged();
        alert.closeConfirm();
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
        $scope.pageChanged();
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user is not a manager anymore.'));
      });
    });
  };

}]);

listControllers.controller('ListEditCtrl', ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, $uibModal, List, alertService, gettextCatalog) {
  if ($routeParams.list) {
    $scope.list = List.get({'listId': $routeParams.list});
  }
  else {
    $scope.list = new List();
    $scope.list.type = 'list';
  }

  // Save list settings
  $scope.listSave = function() {
    if ($scope.list._id) {
      $scope.list.$update(function() {
        $location.path('/lists/' + $scope.list._id);
      });
    }
    else {
      $scope.list.$save(function() {
       $location.path('/lists/' + $scope.list._id);
      });
    }
  };

}]);

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'listService', 'List', function($scope, $routeParams, $q, gettextCatalog, hrinfoService, alertService, listService, List) {
  $scope.request = $routeParams;
  $scope.totalItems = 0;
  $scope.itemsPerPage = 10;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.offset = 0;
  $scope.request.sort = 'name';
  listService.setRequest($scope.request);

  $scope.listTypes = [{
    key: 'operation',
    val: 'Operation'
  },
  {
    key: 'bundle',
    val: 'Group'
  },
  {
    key: 'organization',
    val: 'Organization'
  },
  {
    key: 'disaster',
    val: 'Disaster'
  }];

  var queryCallback = function (lists, headers) {
    $scope.totalItems = headers()["x-total-count"];
  };

  listService.subscribe($scope, function () {
    $scope.currentPage = 1;
    $scope.pageChanged();
  });


  $scope.lists = List.query($scope.request, queryCallback);
  
  $scope.pageChanged = function () {
    $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
    listService.setRequest($scope.request);
    listService.filter(queryCallback);
    $scope.lists = listService.getLists();
  };

  $scope.filter = function() {
    listService.setFilters($scope.filters);
    $scope.currentPage = 1;
    $scope.pageChanged();
  };

}]);

