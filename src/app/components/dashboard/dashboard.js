var dashboardController = angular.module('dashboardController', []);

dashboardController.controller('DashboardCtrl', ['$scope', '$routeParams', '$http', 'config', 'List', function($scope, $routeParams, $http, config, List) {
  $scope.activeList = 0;
  $scope.listsManager = List.query({'managers': $scope.currentUser._id});

  $scope.listsMember = new Array();
  angular.forEach(config.listTypes, function (listType) {
    angular.forEach($scope.currentUser[listType + 's'], function (val, key) {
      var listId = val.list;
      if (typeof val.list === "object") {
        listId = val.list._id;
      }
      var tmpList = List.get({listId: listId}, function () {
        $scope.listsMember.push(tmpList);
      });
    });
  });

  $scope.listsOwner = List.query({'owner': $scope.currentUser._id});

}]);

