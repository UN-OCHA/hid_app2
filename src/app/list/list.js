var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'lists/:listId', {listId: '@id'});
  }
]);

listServices.factory('ListUser', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'lists/:listId/users/:userId', {listId: '@listId', userId: '@userId'}, {
      'get': {method: 'GET', isArray: true}
    });
  }
]); 


var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', 'List', 'ListUser', 'User', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, List, ListUser, User, alertService, gettextCatalog) {
  $scope.list = List.get($routeParams, function () {
    if (angular.equals($scope.list.owner.id, $scope.currentUser.id)) {
      $scope.setAdminAvailable(true);
    }
  });
  $scope.users = ListUser.get($routeParams);
  $scope.usersAdded = {};

  $scope.getUsers = function(search) {
    var users = User.query({'q': search}, function() {
      $scope.newMembers = users;
    });
  };

  $scope.addMemberToList = function() {
    var promises = [];
    angular.forEach($scope.usersAdded.users, function (value, key) {
      var listUser = new ListUser({
        listId: $scope.list.id,
        userId: value
      });
      listUser.$save(function(out) {
        $scope.users = out.users;
      });
    });
  };

}]);

listControllers.controller('ListNewCtrl', ['$scope', '$location', 'List', 'User', function ($scope, $location, List, User) {
  $scope.list = new List();
  $scope.list.type = 'list';
  $scope.users = [];
  $scope.getUsers = function(search) {
    var users = User.query({'q': search}, function() {
      $scope.users = users;
    });
  };

  $scope.listCreate = function() {
    $scope.list.$save(function() {
      $location.path('/lists/' + $scope.list.id);
    });
  };
}]);

listControllers.controller('ListsCtrl', ['$scope', '$routeParams', 'List', function($scope, $routeParams, List) {
  $scope.request = $routeParams;
  $scope.lists = List.query($routeParams);
}]);

