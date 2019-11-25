(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UsersPageController', UsersPageController);

  UsersPageController.$inject = ['$scope', '$location', 'UserDataService'];

  function UsersPageController($scope, $location, UserDataService) {
    var thisScope = $scope;
    thisScope.$on('user-service-ready', function() {
      thisScope.$broadcast('populate-list');
    });
  }

})();
