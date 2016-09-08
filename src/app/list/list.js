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

var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'ListUser', 'User', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, $uibModal, List, ListUser, User, alertService, gettextCatalog) {
  $scope.isMember = false;
  $scope.isManager = false;
  $scope.isOwner = false;
  $scope.currentListUser = {};
  if ($routeParams.listId) {
    $scope.list = List.get($routeParams, function () {
      $scope.setAdminAvailable(true);
      $scope.isMember = $scope.list.isMember($scope.currentUser);
      $scope.checkinUser = new ListUser({
        list: $scope.list.id,
        user: $scope.currentUser.id
      });
      $scope.isOwner = $scope.list.owner.id == $scope.currentUser.id;
    });
    $scope.users = ListUser.query({'list': $routeParams.listId}, function () {
      angular.forEach($scope.users, function (val, key) {
        if (val.user.id == $scope.currentUser.id) {
          $scope.currentListUser = val;
          if (val.role == 'manager') {
            $scope.isManager = true;
          }
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
    var users = User.query({'q': search}, function() {
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
        $scope.users = ListUser.query({'list': $routeParams.listId});
      });
    });
  };

  // Check current user in this list
  $scope.checkIn = function () {
    $scope.checkinUser.$save(function (out) {
      alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
      $scope.isMember = true;
      $scope.users = ListUser.query({'list': $routeParams.listId});
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
        $scope.users = ListUser.query({'list': $routeParams.listId});
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
      /*controller: function() {
        var $ctrl = this;
        $ctrl.emailsText = 'dfsd';
      },
      controllerAs: '$ctrl',*/
      size: 'lg',
      scope: $scope,
      /*resolve: {
        emailsText: () => emailsText,
      }*/
    });
  };


}]);

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', 'List', function($scope, $routeParams, List) {
  $scope.request = $routeParams;
  $scope.lists = List.query($routeParams);
}]);

