(function () {
  'use strict';

  angular
    .module('app.common')
    .factory('offlineService', offlineService);

  offlineService.$inject = ['$log', 'config', 'List'];

  function offlineService($log, config, List) {

    function getFavouriteLists (user) {
      angular.forEach(user.favoriteLists, function (list) {
        if (list._id) {
          List.get({listId: list._id}).$httpPromise.then(function (list) {
            list.cache();
          });
        }
      });
    }

    function getUserLists (user) {
      angular.forEach(config.listTypes, function (listType) {

        angular.forEach(user[listType + 's'], function (userList) {
          if (userList.list) {
            List.get({listId: userList.list}).$httpPromise.then(function (list) {
              list.cache();
            });
          }
        });

      });
    }

    return {
      // Cache user lists for offline use
      cacheListsForUser: function (user) {
        // Make sure we are online to do the caching
        if (Offline.state === 'up') {
          $log.info('Starting Offline caching');
          getFavouriteLists(user);
          getUserLists(user);
          return;
        }
        $log.info('Not doing offline caching:  we are offline');
      }
    };

  }

})();
