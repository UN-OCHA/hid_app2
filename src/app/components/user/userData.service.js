(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserDataService', UserDataService);

  UserDataService.$inject = ['$rootScope', '$log', 'User'];

  function UserDataService($rootScope, $log, User) {

    var UserDataService = {};

    UserDataService.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('users-updated-event', callback);
      scope.$on('$destroy', handler);
      $rootScope.$broadcast('user-service-ready');
    };

    UserDataService.notify = function (request) {
      $rootScope.$emit('users-updated-event', request);
    };

    UserDataService.getUsers = function (params) {
      return User.query(params).$promise.then(function (response) {
        return response;
      }, function (error) {
        $log.error(error);
      });
    };

    return UserDataService;

  }

})();
