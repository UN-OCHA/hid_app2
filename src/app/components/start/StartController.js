(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('StartController', StartController);

  StartController.$inject = ['$location', '$scope', 'User'];

  function StartController($location, $scope, User) {
    var thisScope = $scope;

  	User.get({userId: thisScope.currentUser._id}, function (user) {
      thisScope.user = user;
      thisScope.$broadcast('userLoaded');
    });
  }
})();
