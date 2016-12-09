(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersPageCtrl', UsersPageCtrl);

  UsersPageCtrl.$inject = ['$scope', '$location', 'UserDataService'];

  function UsersPageCtrl($scope, $location, UserDataService) {

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
