(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('StartCtrl', StartCtrl);

  StartCtrl.$inject = ['$location', '$scope', 'User'];

  function StartCtrl($location, $scope, User) {

  	User.get({userId: $scope.currentUser._id}, function (user) {
      $scope.user = user;
      $scope.$broadcast('userLoaded');
    });    
  }
})();
