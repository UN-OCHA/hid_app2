(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .factory('Duplicate', Duplicate);

  Duplicate.$inject = ['$resource', 'config'];

  function Duplicate ($resource, config) {
    var Duplicate = $resource(config.apiUrl + 'duplicate/:dupId', {dupId: '@_id'});

    // Delete user
    Duplicate.prototype.delete = function (userId, success, error) {
      $http.delete(config.apiUrl + 'duplicate/' + userId).then(success, error);
    };

    return Duplicate;
  }
})();
