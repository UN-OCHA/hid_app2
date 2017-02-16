(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .controller('DuplicatesCtrl', DuplicatesCtrl);

  DuplicatesCtrl.$inject = ['$scope', '$routeParams', 'Duplicate'];

  function DuplicatesCtrl ($scope, $routeParams, Duplicate) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';

    var setTotalDuplicates = function (duplicates, headers) {
      $scope.totalItems = headers()["x-total-count"];
    };

    $scope.duplicates = Duplicate.query($scope.request, setTotalDuplicates);
  }
})();
