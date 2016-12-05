hidDirectives.directive('hidUsers', ['$rootScope', '$location', '$routeParams', 'gettextCatalog', 'alertService', 'hrinfoService', 'userService', 'User', 'List',
  function($rootScope, $location, $routeParams, gettextCatalog, alertService, hrinfoService, userService, User, List) {
  return {
    restrict: 'E',
    templateUrl: 'app/components/user/users.html',
    scope: true,
    controller: 'UsersCtrl'
  };
}]);
