(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', 'config', 'List'];

  function DashboardCtrl($scope, config, List) {
    $scope.listsManager = List.query({'managers': $scope.currentUser._id});
    $scope.listsOwner = List.query({'owner': $scope.currentUser._id});

    $scope.listsMember = [];
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

  }
})();
