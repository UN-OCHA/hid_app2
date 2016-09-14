var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'List', 'ListUser', function($scope, $routeParams, $http, List, ListUser) {
  $scope.setAdminAvailable(true);

  $scope.listsManager = [];
  $scope.listsMember = ListUser.query({'user': $scope.currentUser.id}, function() {
    angular.forEach($scope.listsMember, function (val, key) {
      if (val.role == 'manager') {
        $scope.listsManager.push(val);
      }
    });
  });

  $scope.listsOwner = List.query({'owner': $scope.currentUser.id});

}]);

