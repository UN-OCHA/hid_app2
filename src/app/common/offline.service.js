(function () {
  'use strict';

  angular
    .module('app.common')
    .factory('offlineService', offlineService);

  offlineService.$inject = ['config', 'List'];

  function offlineService(config, List) {

    return {
      // Cache user lists for offline use
      cacheListsForUser: function (user) {
        // Make sure we are online to do the caching
        if (Offline.state == 'up') {
          var tmpListType = '';
          console.log('Starting Offline caching');
          for (var i = 0, len = user.favoriteLists.length; i < len; i++) {
            List.get({listId: user.favoriteLists[i]._id}).$httpPromise.then(function (list) {
              list.cache();
            });
          }
          for (var i = 0, len = config.listTypes.length; i < len; i++) {
            tmpListType = config.listTypes[i];
            for (var j = 0, jlen = user[tmpListType + 's'].length; j < jlen; j++) {
              List.get({listId: user[tmpListType + 's'][j].list._id}).$httpPromise.then(function (list) {
                list.cache();
              });
            }
          }
        }
        else {
          console.log('Not doing offline caching:  we are offline');
        }
      }
    };

  }

})();
