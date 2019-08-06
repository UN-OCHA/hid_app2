(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('StartController', StartController);

  StartController.$inject = ['$location', '$scope', 'User'];

  function StartController($location, $scope, User) {

  	User.get({userId: $scope.currentUser._id}, function (user) {
      $scope.user = user;
      $scope.$broadcast('userLoaded');
    });
  }
})();
