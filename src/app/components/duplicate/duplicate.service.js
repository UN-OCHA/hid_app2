(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .factory('Duplicate', Duplicate);

  Duplicate.$inject = ['$resource', '$http', 'config'];

  function Duplicate ($resource, $http, config) {
    var Duplicate = $resource(config.apiUrl + 'duplicate/:dupId', {dupId: '@_id'});

    // Delete user
    Duplicate.prototype.delete = function (userId, success, error) {
      $http.delete(config.apiUrl + 'duplicate/' + userId).then(success, error);
    };

    return Duplicate;
  }
})();
