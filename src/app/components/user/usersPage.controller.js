(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersPageCtrl', UsersPageCtrl);

  UsersPageCtrl.$inject = ['$scope', '$location', 'userService'];

  function UsersPageCtrl($scope, $location, userService) {

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
