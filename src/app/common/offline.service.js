(function () {
  'use strict';

  angular
    .module('app.common')
    .factory('offlineService', offlineService);

  offlineService.$inject = ['$localForage', '$log', '$rootScope', 'config', 'List'];

  function offlineService($localForage, $log, $rootScope, config, List) {

    var offlineService = {};

    function updateCachedLists (listId, status) {
      var cachedList = offlineService.cachedLists.find(function(cachedList) {
        return cachedList._id === listId;
      });
      if (cachedList) {
        cachedList.status = status;
      } else {
        offlineService.cachedLists.push({_id: listId, status: status});
      }

      $rootScope.$broadcast('updateCachedLists');
    }

    function getFavouriteLists (user) {
      angular.forEach(user.favoriteLists, function (list) {
        if (list._id) {
          updateCachedLists(list._id, 'caching');
          List.get({listId: list._id}).$promise.then(function (list) {
            list.cache().then(function () {
              updateCachedLists(list._id, 'success');
            }, function () {
              updateCachedLists(list._id, 'fail');
            });
          });
        }
      });
    }

    function getUserLists (user) {
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          updateCachedLists(userList.list, 'caching');
          if (userList.list) {
            List.get({listId: userList.list}).$promise.then(function (list) {
              list.cache().then(function (){
                updateCachedLists(userList.list, 'success');
              }, function () {
                updateCachedLists(userList.list, 'fail');
              });
            });
          }
        });
      });
    }

    offlineService = {
      cachedLists: [],

      checkCachedLists: function () {
        var lflists = $localForage.instance('lists');

        lflists.iterate(function (list) {
          var cachedList = offlineService.cachedLists.find(function(cachedList) {
            return cachedList._id === list._id;
          });
          if (!cachedList) {
            offlineService.cachedLists.push({_id: list._id, status: 'success'});
          }
        }).then(function () {
          $rootScope.$broadcast('updateCachedLists');
        });
      },

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

    return offlineService;

  }

})();
