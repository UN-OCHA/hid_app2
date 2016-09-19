var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$resource', 'config',
  function ($resource, config) {
    var List = $resource(config.apiUrl + 'lists/:listId', {listId: '@id'});
    List.prototype.isMember = function (user) {
      var out = false;
      angular.forEach(this.users, function (val, key) {
        if (angular.equals(user.id, val.id)) {
          out = true;
        }
      });
      return out;
    };
    return List;
  }
]);

listServices.factory('ListUser', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'listusers/:listUserId', {listUserId: '@id'});
  }
]);

listServices.factory('FavoriteList', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'users/:userId/favoriteLists/:listId', {userId: '@userId', listId: '@listId'});
  }
]);

var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'ListUser', 'FavoriteList', 'User', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, $uibModal, List, ListUser, FavoriteList, User, alertService, gettextCatalog) {
  $scope.isMember = false;
  $scope.isManager = false;
  $scope.isOwner = false;
  $scope.isFavorite = false;
  $scope.currentListUser = {};
  $scope.currentUserResource = User.get({userId: $scope.currentUser.id});

  $scope.request = {};
  $scope.totalItems = 0;
  $scope.itemsPerPage = 1;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.skip = 0;
 
  // Helper function 
  var queryCallback = function (listusers, headers) {
    $scope.totalItems = headers()["x-total-count"];
    angular.forEach($scope.users, function (val, key) {
      if (val.user.id == $scope.currentUser.id) {
        $scope.currentListUser = val;
        if (val.role == 'manager') {
          $scope.isManager = true;
        }
      }
    });
  };

  // Pager
  $scope.pageChanged = function () {
    $scope.request.skip = ($scope.currentPage - 1) * $scope.itemsPerPage;
    $scope.users = ListUser.query($scope.request, queryCallback);
  };


  if ($routeParams.listId) {
    $scope.list = List.get($routeParams, function () {
      $scope.setAdminAvailable(true);
      $scope.isMember = $scope.list.isMember($scope.currentUser);
      $scope.checkinUser = new ListUser({
        list: $scope.list.id,
        user: $scope.currentUser.id
      });
      $scope.isOwner = $scope.list.owner.id == $scope.currentUser.id;
      angular.forEach($scope.currentUser.favoriteLists, function (val, key) {
        if (val.id == $scope.list.id) {
          $scope.isFavorite = true;
        }
      });
    });
    $scope.request.list = $routeParams.listId;
    $scope.users = ListUser.query($scope.request, queryCallback);

  }
  else {
    $scope.list = new List();
    $scope.list.type = 'list';
    $scope.users = [];
  }
  $scope.usersAdded = {};

  // Retrieve users
  $scope.getUsers = function(search) {
    var users = User.query({'where': {'name': {'contains': search}}}, function() {
      $scope.newMembers = users;
    });
  };

  // Save list settings
  $scope.listSave = function() {
    if ($routeParams.listId) {
      delete $scope.list.users;
    }
    $scope.list.$save(function() {
      $location.path('/lists/' + $scope.list.id);
    });
  };

  // Add users to a list
  $scope.addMemberToList = function() {
    var promises = [];
    angular.forEach($scope.usersAdded.users, function (value, key) {
      var listUser = new ListUser({
        list: $scope.list.id,
        user: value
      });
      listUser.$save(function(out) {
        $scope.users = ListUser.query($scope.request);
      });
    });
  };

  // Remove a user from a list
  $scope.removeFromList = function (lu) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      ListUser.delete({listUserId: lu.id }, function(out) {
        // Close existing alert
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user was successfully removed.'));
        $scope.users = ListUser.query($scope.request);
      });
    });
  };


  // Check current user in this list
  $scope.checkIn = function () {
    $scope.checkinUser.$save(function (out) {
      alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
      $scope.isMember = true;
      $scope.users = ListUser.query($scope.request);
    });
  };

  // Check current user out of this list
  $scope.checkOut = function () {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      $scope.currentListUser.$delete(function (out) {
        // Close existing alert
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
        $scope.isMember = false;
        $scope.users = ListUser.query($scope.request);
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
      $scope.emailsText += $scope.users[i].user.name + ' <' + $scope.users[i].user.email + '>';
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
    FavoriteList.save({userId: $scope.currentUser.id, listId: $scope.list.id}, function (user) {
      alertService.add('success', gettextCatalog.getString('This list was successfully added to your favorites.'));
      $scope.isFavorite = true;
      $scope.setCurrentUser(user);
    });
  };

  // Remove a list from favorites
  $scope.unstar = function() {
    FavoriteList.delete({userId: $scope.currentUser.id, listId: $scope.list.id}, function (user) {
      alertService.add('success', gettextCatalog.getString('This list was successfully removed from your favorites.'));
      $scope.isFavorite = false;
      $scope.setCurrentUser(user);
    });
  };

  // Approve a user and remove his pending status
  $scope.approveUser = function (lu) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      lu.pending = false;
      lu.$save(function (listuser, response) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user was successfully approved.'));
      });
    });
  };

  // Promote a user to manager
  $scope.promoteManager = function (lu) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      lu.role = 'manager';
      lu.$save(function (listuser, response) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user was successfully promoted to manager.'));
      });
    });
  };

  // Demote a user from manager role
  $scope.demoteManager = function (lu) {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      lu.role = 'member';
      lu.$save(function (listuser, response) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The user is not a manager anymore.'));
      });
    });
  };

}]);

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'List', 'ListUser', function($scope, $routeParams, $q, gettextCatalog, hrinfoService, alertService, List, ListUser) {
  $scope.request = $routeParams;
  $scope.totalItems = 0;
  $scope.itemsPerPage = 1;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.skip = 0;
  $scope.lists = List.query($scope.request, function(lists, headers) {
    $scope.totalItems = headers()["x-total-count"];
  });
  $scope.pageChanged = function () {
    $scope.request.skip = ($scope.currentPage - 1) * $scope.itemsPerPage;
    $scope.lists = List.query($scope.request);
  };

}]);

