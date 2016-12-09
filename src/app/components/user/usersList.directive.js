(function() {
  'use strict';

  angular
    .module('app.user')
    .directive('usersList', usersList);

  function usersList() {

    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/user/users.html',
      scope: true,
      controller: 'UsersCtrl'
    };

    return directive;
  }
})();
