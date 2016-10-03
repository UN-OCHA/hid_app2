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

var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'User', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, $uibModal, List, User, alertService, gettextCatalog) {
  $scope.isMember = false;
  $scope.isManager = false;
  $scope.isOwner = false;
  $scope.isFavorite = false;

  if ($routeParams.list) {
    $scope.list = List.get({'listId': $routeParams.list}, function () {
      $scope.pageChanged();
      $scope.setAdminAvailable(true);
      angular.forEach($scope.currentUser.checkins, function (val, key) {
        if (val.list == $scope.list._id) {
          $scope.isMember = true;
        }
      });
      $scope.isManager = $scope.list.isManager($scope.currentUser);
      $scope.checkinUser = {
        list: $scope.list._id
      };
      $scope.isOwner = $scope.list.owner._id == $scope.currentUser._id;
      angular.forEach($scope.currentUser.favoriteLists, function (val, key) {
        if (val._id == $scope.list._id) {
          $scope.isFavorite = true;
        }
      });
    });
  }
  else {
    $scope.list = new List();
    $scope.list.type = 'list';
    $scope.users = [];
  }
  $scope.usersAdded = {};

  // Retrieve users
  $scope.getUsers = function(search) {
    $scope.newMembers = User.query({'name': search});
  };

  // Retrieve managers
  $scope.getManagers = function(search) {
    $scope.newManagers = User.query({'name': search});
  };

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

  // Add users to a list
  $scope.addMemberToList = function() {
    var promises = [];
    angular.forEach($scope.usersAdded.users, function (value, key) {
      var tmpUser = User.get({userId: value}, function() {
        if (!tmpUser.checkins) {
          tmpUser.checkins = new Array();
        }
        tmpUser.checkins.push({list: $scope.list._id});
        tmpUser.$update(function(out) {
          $scope.pageChanged();
        });
      });
    });
  };

  // Remove a user from a list
  $scope.removeFromList = function (user) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      user.checkins = user.checkins.filter(function (elt) {
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
    if (!$scope.currentUser.checkins) {
      $scope.currentUser.checkins = new Array();
    }
    $scope.currentUser.checkins.push($scope.checkinUser);
    User.update($scope.currentUser, function (user) {
      alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
      $scope.isMember = true;
      $scope.setCurrentUser($scope.currentUser);
      $scope.refreshUsers();
    });
  };

  // Check current user out of this list
  $scope.checkOut = function () {
    $scope.currentUser.checkins = $scope.currentUser.checkins.filter(function (elt) {
      return elt.list != $scope.list._id;
    });
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      User.update($scope.currentUser, function (user) {
        // Close existing alert
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
        $scope.isMember = false;
        $scope.setCurrentUser($scope.currentUser);
        $scope.refreshUsers();
      });
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
      for (var i = 0, len = user.checkins.length; i < len; i++) {
        if (user.checkins[i].list == $scope.list._id) {
          user.checkins[i].pending = false;
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

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'List', function($scope, $routeParams, $q, gettextCatalog, hrinfoService, alertService, List) {
  $scope.request = $routeParams;
  $scope.totalItems = 0;
  $scope.itemsPerPage = 1;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.offset = 0;

  $scope.lists = List.query($scope.request, function(lists, headers) {
    $scope.totalItems = headers()["x-total-count"];
  });
  $scope.pageChanged = function () {
    $scope.request.offset = ($scope.currentPage - 1) * $scope.itemsPerPage;
    $scope.lists = List.query($scope.request);
  };

}]);

