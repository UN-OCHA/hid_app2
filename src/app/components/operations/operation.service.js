(function () {
  'use strict';

  angular
    .module('app.operations')
    .factory('Operation', Operation);

  Operation.$inject = ['$resource', 'config'];

  function Operation ($resource, config) {
    var Operation = $resource(config.apiUrl + 'operation/:operationId', {operationId: '@_id'},
    {
      'save': {
        method: 'POST'
      },
      'remove': {
        method: 'DELETE'
      },
      'delete': {
        method: 'DELETE'
      },
      'update': {
        method: 'PUT'
      }
    });

    // Is a user manager of a list ?
    Operation.prototype.isManager = function (user) {
      var out = false;
      angular.forEach(this.managers, function (val) {
        if (angular.equals(user._id, val._id)) {
          out = true;
        }
      });
      return out;
    };

    Operation.prototype.setListTypes = function () {
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

      this.key_lists.map(function (list) {
        var listType = listTypes.filter(function (type) {
          return type.key === list.type;
        })[0];
        if (listType) {
          list.displayType = listType.val;
        }
        return list;
      });
    };

    return Operation;
  }
})();
