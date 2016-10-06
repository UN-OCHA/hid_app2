var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'config', 'List', function($scope, $routeParams, $http, config, List) {
  $scope.setAdminAvailable(true);

  $scope.listsManager = List.query({'managers': $scope.currentUser._id});

  $scope.listsMember = new Array();
  angular.forEach(config.listTypes, function (listType) {
    angular.forEach($scope.currentUser[listType + 's'], function (val, key) {
      var tmpList = List.get({listId: val.list}, function () {
        $scope.listsMember.push(tmpList);
      });
    });
  });

  $scope.listsOwner = List.query({'owner': $scope.currentUser._id});

}]);

