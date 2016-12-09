(function () {
  'use strict';

  angular
    .module('app.list')
    .factory('listService', ListDataService);

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

      subscribe: function(scope, callback) {
        var handler = $rootScope.$on('lists-updated-event', callback);
        scope.$on('$destroy', handler);
      },

      notify: function () {
        $rootScope.$emit('lists-updated-event');
      }
    };
  }
})();