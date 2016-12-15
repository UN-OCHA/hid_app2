(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', '$routeParams', '$http', 'config', 'List'];

  function DashboardCtrl($scope, $routeParams, $http, config, List) {
    $scope.activeList = 0;
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
  }
})();
