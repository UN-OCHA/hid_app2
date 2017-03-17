(function () {
  'use strict';

  angular
    .module('app.user')
    .factory('UserListsService', UserListsService);

  UserListsService.$inject = ['$rootScope', '$exceptionHandler', '$log', '$localForage', 'config', 'List', 'ListDataService'];

  function UserListsService($rootScope, $exceptionHandler, $log, $localForage, config, List, ListDataService) {
    var userLists = {
      cachedLists: [],
      cacheListsForUser: cacheListsForUser,
      favoriteLists: [],
      getListsForUser: getListsForUser,
      listsMember: [],
      listsOwnedAndManaged: []
    };

    function getCachedList (listId) {
      return userLists.cachedLists.filter(function(cachedList) {
        return cachedList._id === listId;
      })[0];
    }

    function updateCachedLists (listId, status) {
      var cachedList = getCachedList(listId);
      if (cachedList) {
        cachedList.status = status;
      } else {
        userLists.cachedLists.push({_id: listId, status: status});
      }
      updateListsCacheStatus();
    }

    function updateListCacheStatus (list) {
      var cachedList = getCachedList(list._id);
      if (cachedList) {
        list.cacheStatus = cachedList.status;
      }
      return list;
    }

    function isCurrentlyCaching (listId) {
      var cachedList = getCachedList(listId);

      if (cachedList && cachedList.status === 'caching') {
        return true;
      }
    }

    function cacheList (listId) {
      if (isCurrentlyCaching()) {
        return;
      }
      // check as currently bug where api response has full lists on the user
      if (typeof listId !== 'string') {
        return;
      }

      updateCachedLists(listId, 'caching');
      List.get({listId: listId}).$promise.then(function (list) {
        list.cache().then(function () {
          updateCachedLists(list._id, 'success');
        }, function () {
          updateCachedLists(list._id, 'fail');
        });
      });
    }

    function cacheFavoriteLists (user) {
      var lists = user.favoriteLists;
      angular.forEach(lists, function (list) {        
        if (list._id) {
          cacheList(list._id);  
        }
      });
    }

    function getFavoriteLists (user) {
      var lists = user.favoriteLists;
      angular.forEach(lists, function (list) {        
        if (list._id) {
          updateListCacheStatus(list);

          if (!getCachedList(list._id)) {
            cacheList(list._id); 
          }

        }
      });
      userLists.favoriteLists = lists;
    }

    function cacheListsMember (user) {
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (checkin) {
          if (!checkin.list) { return; }
          cacheList(checkin.list);
        });
      });
    }

    function getListsMember (user) {
      var lists = [];
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (checkin) {
          if (!checkin.list) { return; }
          // construct a list object so don't need to make an extra api request for the list here
          var list = {
            _id: checkin.list,
            name: checkin.name,
            type: listType,
            checkinId: checkin._id
          };
          updateListCacheStatus(list);
          lists.push(list);

          if (!getCachedList(checkin.list)) {
            cacheList(checkin.list); 
          }
        });
      });
      
      userLists.listsMember = lists;
    }

    function cacheOwnedAndManagedLists (user) {
      return ListDataService.getManagedAndOwnedLists(user, '', function (lists) {
        angular.forEach(lists, function (list) {
          if (list._id) {
            if (isCurrentlyCaching()) {
              return;
            }
            updateCachedLists(list._id, 'caching');
            list.cache().then(function () {
              updateCachedLists(list._id, 'success');
            }, function () {
              updateCachedLists(list._id, 'fail');
            });
          }
        });

      });
    }

    function getOwnedAndManagedLists (user) {      
      userLists.listsOwnedAndManaged = [];

      if (Offline.state !== 'up') {

        if (!user.appMetadata || !user.appMetadata.hid || !user.appMetadata.hid.listsOwnedAndManaged) {
          return;
        }

        var listIds = user.appMetadata.hid.listsOwnedAndManaged;
        var lflists = $localForage.instance('lists');
        angular.forEach(listIds, function (listId) {

          lflists.iterate(function (list, key, index) {
            if (list._id === listId) {
              userLists.listsOwnedAndManaged.push(list);
            }
          });

        });

        return;
      }

      return ListDataService.getManagedAndOwnedLists(user, '', function (lists) { 
        angular.forEach(lists, function (list) {
          if (list._id) {
            updateListCacheStatus(list);

            var inArray = userLists.listsOwnedAndManaged.filter(function(l) {
              return l._id === list._id;
            })[0];

            if (!inArray) {
              userLists.listsOwnedAndManaged.push(list);
            }
            if (!getCachedList(list._id)) {
              updateCachedLists(list._id, 'caching');
              list.cache().then(function () {
                updateCachedLists(list._id, 'success');
              }, function () {
                updateCachedLists(list._id, 'fail');
              });
            }
          }
        });
        $rootScope.$emit('usersListsLoaded');

      });
    }

    function updateListsCacheStatus () {
      angular.forEach(userLists.listsMember, function (list) {
        updateListCacheStatus(list);
      });
      angular.forEach(userLists.favoriteLists, function (list) {
        updateListCacheStatus(list);
      });
      angular.forEach(userLists.listsOwnedAndManaged, function (list) {
        updateListCacheStatus(list);
      });
    }

    function cacheListsForUser (user) {
      if (!user || Offline.state !== 'up') { return; }
      cacheFavoriteLists(user);
      cacheListsMember(user);
      cacheOwnedAndManagedLists(user);
    }

    function getListsForUser (user) {
      getFavoriteLists(user);
      getListsMember(user);
      getOwnedAndManagedLists(user);
    }

    return userLists;

  }

})();

