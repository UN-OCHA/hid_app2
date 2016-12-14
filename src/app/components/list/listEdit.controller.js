(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListEditCtrl', ListEditCtrl);

  ListEditCtrl.$inject = ['$scope', '$routeParams', '$location', '$uibModal', 'List', 'User', 'alertService', 'gettextCatalog'];

  function ListEditCtrl($scope, $routeParams, $location, $uibModal, List, User, alertService, gettextCatalog) {
    if ($routeParams.list) {
      $scope.list = List.get({'listId': $routeParams.list});
    }
    else {
      $scope.list = new List();
      $scope.list.type = 'list';
    }

    // Retrieve managers
    $scope.getManagers = function(search) {
      $scope.newManagers = User.query({'name': search});
    };

    // Save list settings
    $scope.listSave = function() {
      if ($scope.list._id) {
        $scope.list.$update();
        $scope.list.$promise.then(function() {
          $location.path('/lists/' + $scope.list._id);
        });
      }
      else {
        $scope.list.label = $scope.list.name;
        $scope.list = List.save($scope.list);
        $scope.list.$promise.then(function() {
          $location.path('/lists/' + $scope.list._id);
        });
      }
    };
  }
})();
