(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('ListDataService', ListDataService);

  ListDataService.$inject = ['$rootScope', '$localForage', 'List'];

  function ListDataService($rootScope, $localForage, List) {
    var filters = {}, lists = {}, request = {};
    var listTypes = [
      {
        key: 'operation',
        val: 'Operation'
      },
      {
        key: 'bundle',
        val: 'Group'
      },
      {
        key: 'organization',
        val: 'Organization'
      },
      {
        key: 'disaster',
        val: 'Disaster'
      },
      {
        key: 'functional_role',
        val: 'Role'
      },
      {
        key: 'office',
        val: 'Co-ordination hub'
      },
      {
        key: 'list',
        val: 'Custom'
      }
    ];

    return {
      // addFilter: function(key, val, notify) {
      //   filters[key] = val;
      //   if (notify) this.notify();
      // },

      setFilters: function(filters2, notify) {
        filters = filters2;
        if (notify) this.notify();
      },

      setRequest: function (req, notify) {
        request = req;
        if (notify) this.notify();
      },

      // removeFilter: function(key, notify) {
      //   delete filters[key];
      //   if (notify) this.notify();
      // },

      filter: function(cb) {
        var trequest = angular.copy(request);
        lists.length = 0;
        angular.merge(trequest, filters);
        lists = List.query(trequest, cb);
      },

      queryLists: function (request, cb) {
        List.query(request, function (lists, headers) {
          var count = headers()['x-total-count'];
          return cb(lists, count);
        }, function (resp) {
          // Offline fallback
          var lists = [];
          var lflists = $localForage.instance('lists');
          lflists.iterate(function (list, key, index) {
            if (index > request.offset && index < request.offset + request.limit) {
              lists.push(list);
            }
          })
          .then(function () {
            lflists.length().then(function (number) {
              return cb(lists, number);
            });
          });
        });
      },

      getLists: function() {
        return lists;
      },

      getManagedAndOwnedLists: function (user, searchTerm, callback) {
        var params = {'owner': user._id};
        if (searchTerm) {
          params.name = searchTerm;
        }
        List.query(params, function (data) {
          addManagedLists(user, data, List, searchTerm, callback);
        });
      },

      subscribe: function(scope, callback) {
        var handler = $rootScope.$on('lists-updated-event', callback);
        scope.$on('$destroy', handler);
      },

      notify: function () {
        $rootScope.$emit('lists-updated-event');
      },

      listTypes: listTypes,

      setListTypeLabel: function (list) {
        var listType = listTypes.filter(function (type) {
          return type.key === list.type;
        })[0];
        if (listType) {
          list.displayType = listType.val;
        }
        return list;
      }
    };
  }

  function addManagedLists (user, ownedLists, List, searchTerm, callback) {
    var params = {'managers': user._id};
    if (searchTerm) {
      params.name = searchTerm;
    }
    List.query(params, function (managedLists) {
      //remove lists that are also owned before merging with owned lists
      var filteredManagedLists = managedLists.filter(function (list) {
        var isOwned = false;
        for(var i = 0; i < ownedLists.length; i++) {
          if (ownedLists[i]._id === list._id) {
            isOwned = true;
          }
        }
        return !isOwned;
      });

      var lists = ownedLists.concat(filteredManagedLists);
      return callback(lists);
    });
  }
})();
