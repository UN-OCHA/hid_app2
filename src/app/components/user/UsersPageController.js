(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersPageController', UsersPageController);

  UsersPageController.$inject = ['$scope', '$location', 'UserDataService'];

  function UsersPageController($scope, $location, UserDataService) {

    $scope.$on('user-service-ready', function() {
      $scope.$broadcast('populate-list');
    });
  }

})();
