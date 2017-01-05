(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('ListDataService', ListDataService);

  ListDataService.$inject = ['$rootScope', 'List'];

  function ListDataService($rootScope, List) {
    var filters = {}, lists = {}, request = {};

    return {
      addFilter: function(key, val, notify) {
        filters[key] = val;
        if (notify) this.notify();
      },

      setFilters: function(filters2, notify) {
        filters = filters2;
        if (notify) this.notify();
      },

      setRequest: function (req, notify) {
        request = req;
        if (notify) this.notify();
      },

      removeFilter: function(key, notify) {
        delete filters[key];
        if (notify) this.notify();
      },

      filter: function(cb) {
        var trequest = angular.copy(request);
        lists.length = 0;
        angular.merge(trequest, filters);
        lists = List.query(trequest, cb);
      },

      getLists: function() {
        return lists;
      },

      getManagedAndOwnedLists: function (user, callback) {
        List.query({'owner': user._id}, function (data) {
          addManagedLists(user, data, List, callback);
        });
      },

      subscribe: function(scope, callback) {
        var handler = $rootScope.$on('lists-updated-event', callback);
        scope.$on('$destroy', handler);
      },

      notify: function () {
        $rootScope.$emit('lists-updated-event');
      }
    };
  }

  function addManagedLists (user, ownedLists, List, callback) {
    List.query({'managers': user._id}, function (managedLists) {
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


