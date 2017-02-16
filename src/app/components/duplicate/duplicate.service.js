(function () {
  'use strict';

  angular
    .module('app.duplicate')
    .factory('Duplicate', Duplicate);

  Duplicate.$inject = ['$resource', 'config'];

  function Duplicate ($resource, config) {
    var Duplicate = $resource(config.apiUrl + 'duplicate/:dupId', {dupId: '@_id'});

    return Duplicate;
  }
})();
