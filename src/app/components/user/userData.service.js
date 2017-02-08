(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserDataService', UserDataService);

  UserDataService.$inject = ['$rootScope', '$localForage', '$exceptionHandler', 'User'];

  function UserDataService($rootScope, $localForage, $exceptionHandler, User) {

    var UserDataService = {};
    UserDataService.listUsers = [];
    UserDataService.listUsersTotal = 0;
    UserDataService.user = {};

    UserDataService.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('users-updated-event', callback);
      scope.$on('$destroy', handler);
      $rootScope.$broadcast('user-service-ready');
    };

    UserDataService.notify = function (request) {
      $rootScope.$emit('users-updated-event', request);
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

    UserDataService.getUser = function (userId, callback) {
      User.get({userId: userId}).$promise.then(function (user) {
        var lfusers = $localForage.instance('users');
        lfusers.setItem(user.id, user);
        UserDataService.user = transformUser(user);
        return callback();
      })
      .catch(function (err) {
        var lfusers = $localForage.instance('users');
        lfusers.getItem(userId).then(function (user) {
          transformUser(user);
        });
        return callback();
      });
    };

    UserDataService.formatUserLocations = function () {
      formatLocations (UserDataService.user.locations, UserDataService.user.location);
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

  function getPrimaryIndex (type, object, primary) {
    if (type === 'phone') {
      return object.map(function (phoneNumber) {
        return phoneNumber.number;
      }).indexOf(primary);
    }

    if (type === 'email') {
      return object.map(function (email) {
        return email.email;
      }).indexOf(primary);
    }

    if (type === 'organization') {
      return object.map(function (org) {
        return org.list;
      }).indexOf(primary.list);
    }

    if (type === 'jobTitle') {
      return object.indexOf(primary);
    }

    if (type === 'location') {
      var primaryIndex;
      angular.forEach(object, function (location, index) {
        if (angular.equals(location, primary)) {
          primaryIndex = index;
        }
      });
      return primaryIndex;
    }
  }

  function orderByPrimary (type, object, primary) {
    if (!primary) {
      return object;
    }
    var primaryIndex = getPrimaryIndex(type, object, primary);
    var primaryObject = object.splice(primaryIndex,1)[0];

    if (primaryIndex !== -1 && primaryObject) {
      object.splice(0, 0, primaryObject);
    }
    return object;
  }

  function addTempLocationId (location, index) {
    location.tempId = location.country ? location.country.id : '';
    location.tempId += '-' + index;
    return location;
  }

  function formatLocations (locations, primary) {
    if (!primary) {
      return;
    }
    angular.forEach(locations, function (location, index) {        
      if (angular.equals(location, primary)) {
        addTempLocationId(location, index);
        primary.tempId = location.tempId;
        return;
      }

      addTempLocationId(location, index);
    });
  }

  function transformUser (user) {
    orderByPrimary('location', user.locations, user.location);
    orderByPrimary('email', user.emails, user.email);
    orderByPrimary('phone', user.phone_numbers, user.phone_number);
    orderByPrimary('organization', user.organizations, user.organization);
    orderByPrimary('jobTitle', user.job_titles, user.job_title);
    formatLocations(user.locations, user.location);
    return user;
  }

})();
