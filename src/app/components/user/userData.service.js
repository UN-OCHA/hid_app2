(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserDataService', UserDataService);

  UserDataService.$inject = ['$rootScope', '$log', '$localForage', 'User'];

  function UserDataService($rootScope, $log, $localForage, User) {

    var UserDataService = {};
    UserDataService.listUsers = [];
    UserDataService.listUsersTotal = 0;

    UserDataService.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('users-updated-event', callback);
      scope.$on('$destroy', handler);
      $rootScope.$broadcast('user-service-ready');
    };

    UserDataService.notify = function (request) {
      $rootScope.$emit('users-updated-event', request);
    };

    UserDataService.getHttpUsers = function (users, list) {
      return users.$promise.then(function (response) {
        UserDataService.listUsers = list ? transformUsers(response, list) : response;
        UserDataService.listUsersTotal = response.headers["x-total-count"];
        return;
      }, function (error) {
        $log.error(error);
      });
    };

    // Belongs to list
    UserDataService.userHasList = function (user, list) {
      var out = false;
      if (user[list.type + 's'] && user[list.type + 's'].length) {
        for (var i = 0; i < user[list.type + 's'].length; i++) {
          if (user[list.type + 's'][i].list === list._id) {
            out = true;
          }
        }
      }
      return out;
    };

    UserDataService.getUsers = function (params, list, callback) {
      // cached resource is returned immediately
      return User.query(params, function (response, headers) {
        UserDataService.listUsers = list ? transformUsers(response, list) : response;
        UserDataService.listUsersTotal = headers()["x-total-count"];

        // transform users again when the http response resolves so don't lose changes
        // otherwise it overwrites them
        //UserDataService.getHttpUsers(response, list);
        return callback();
      }, function (response) {
        // Indexeddb fallback
        var lfusers = $localForage.instance('users');
        var users = [], nbUsers = 0;
        lfusers.iterate(function (user, key, index) {
          if (!list) {
            if (index > params.offset && index < params.offset + params.limit) {
              users.push(user);
            }
            nbUsers++;
          }
          else {
            if (UserDataService.userHasList(user, list)) {
              nbUsers++;
              if (nbUsers > params.offset && nbUsers < params.offset + params.limit) {
                users.push(user);
              }
            }
          }
        })
        .then(function () {
          UserDataService.listUsers = users;
          UserDataService.listUsersTotal = nbUsers;
          return callback();
        });
      });
    };

    return UserDataService;
  }

  function checkPending (user, listType, listId) {
    angular.forEach(user[listType], function (userList) {
      if ( (listId === userList.list) && userList.pending) {
        user.pending = true;
      }
    });
    return user;
  }

  function filterClusters (user, operationName) {
      var bundles = user.bundles;
      var operationBundles = [];
      var displayName = '';

      if (!bundles.length) {
        return user;
      }

      angular.forEach(bundles, function (bundle) {
        if (bundle.name.indexOf(operationName) !== -1) {
          displayName = bundle.name.replace(operationName + ' :', '');
          displayName = displayName.replace(operationName + ':', '');
          bundle.displayName = displayName;
          operationBundles.push(bundle);
        }
      });

      user.operationBundles = operationBundles;
      return user;
    }

  function transformUsers (users, list) {
    angular.forEach(users, function (user) {
      checkPending(user, list.type + 's', list._id);
      if (list.type === 'operation') {
        filterClusters(user, list.name);
      }
    });
    return users;
  }

})();
