var listServices = angular.module('listServices', ['ngResource']);

listServices.factory('List', ['$resource',
  function ($resource) {
    return $resource('http://auth.hid.vm/api/v2/lists/:listId', {listId: '@id'});
  }
]);


var listControllers = angular.module('listControllers', []);

listControllers.controller('ListCtrl', ['$scope', '$routeParams', 'List', function ($scope, $routeParams, List) {
  $scope.list = List.get($routeParams);
}]);

listControllers.controller('ListNewCtrl', ['$scope', '$location', 'List', function ($scope, $location, List) {
  $scope.list = new List();
  $scope.list.owner = '226dc843-28eb-4bb6-a30c-cbf351addde1';
  $scope.list.type = 'list';

  $scope.listCreate = function() {
    $scope.list.$save(function() {
      $location.path('/lists/' + $scope.list.id);
    });
  };
}]);
