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

listControllers.controller('ListCtrl', ['$scope', '$routeParams', '$location', 'List', 'ListUser', 'User', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, $location, List, ListUser, User, alertService, gettextCatalog) {
  $scope.isMember = false;
  $scope.isManager = false;
  if ($routeParams.listId) {
    $scope.list = List.get($routeParams, function () {
      $scope.setAdminAvailable(true);
      $scope.isMember = $scope.list.isMember($scope.currentUser);
      $scope.checkinUser = new ListUser({
        list: $scope.list.id,
        user: $scope.currentUser.id
      });
    });
    $scope.users = ListUser.query({'list': $routeParams.listId}, function () {
      angular.forEach($scope.users, function (val, key) {
        if (val.user.id == $scope.currentUser.id && val.role == 'manager') {
          $scope.isManager = true;
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

  $scope.getUsers = function(search) {
    var users = User.query({'q': search}, function() {
      $scope.newMembers = users;
    });
  };

  $scope.listSave = function() {
    if ($routeParams.listId) {
      delete $scope.list.users;
    }
    $scope.list.$save(function() {
      $location.path('/lists/' + $scope.list.id);
    });
  };

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

  $scope.checkIn = function () {
    $scope.checkinUser.$save(function (out) {
      alertService.add('success', gettextCatalog.getString('You were successfully checked in.'));
      $scope.users = ListUser.query({'list': $routeParams.listId});
    });
  };

  $scope.checkOut = function () {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      ListUsers.delete({listId: $scope.list.id, userId: $scope.currentUser.id }, function(out) {
        // Close existing alert
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('You were successfully checked out.'));
        $scope.users = ListUser.query({'list': $routeParams.listId});
      });
    });
  };

  $scope.deleteList = function() {
    var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
      $scope.list.$delete(function (out) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('The list was successfully deleted.'));
        $location.path('/lists');
      });
    });
  };


}]);

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', 'List', function($scope, $routeParams, List) {
  $scope.request = $routeParams;
  $scope.lists = List.query($routeParams);
}]);

