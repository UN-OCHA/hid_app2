var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'lists/:listId', {listId: '@id'});
  }
]);

listServices.factory('ListUser', ['$resource', 'config',
  function ($resource, config) {
    return $resource(config.apiUrl + 'lists/:listId/users/:userId', {}, {
      'get': {method: 'GET', isArray: true}
    });
  }
]); 


var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', 'List', 'ListUser', 'alertService', 'gettextCatalog',  function ($scope, $routeParams, List, ListUser, alertService, gettextCatalog) {
  $scope.list = List.get($routeParams);
  $scope.users = ListUser.get($routeParams);

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

