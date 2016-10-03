var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'List', function($scope, $routeParams, $http, List) {
  $scope.setAdminAvailable(true);

  $scope.listsManager = List.query({'managers': $scope.currentUser._id});

  $scope.listsMember = new Array();
  angular.forEach($scope.currentUser.checkins, function (val, key) {
    var tmpList = List.get({listId: val.list}, function () {
      $scope.listsMember.push(tmpList);
    });
  });

  $scope.listsOwner = List.query({'owner': $scope.currentUser._id});

}]);

