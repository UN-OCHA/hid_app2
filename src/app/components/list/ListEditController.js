(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListEditController', ListEditController);

  ListEditController.$inject = ['$scope', '$routeParams', '$location', 'List', 'User', 'gettextCatalog'];

  function ListEditController($scope, $routeParams, $location, List, User, gettextCatalog) {
    var thisScope = $scope;

    thisScope.saving = false;
    thisScope.newManagers = [];
    thisScope.visibility = [];
    thisScope.joinability = [];
    thisScope.listSave = listSave;
    thisScope.getManagers = getManagers;

    initList();

    function initList () {
      if ($routeParams.list) {
        thisScope.list = List.get({'listId': $routeParams.list});
        return;
      }
      thisScope.list = new List();
      thisScope.list.type = 'list';
      if (thisScope.currentUser.verified !== true) {
        thisScope.list.visibility = 'me';
        thisScope.list.joinability = 'private';
      }
    }

    function getManagers (search) {
      if (search === '') {
        return;
      }

      thisScope.newManagers = User.query({name: search,  authOnly: false});
    }

    function formatManagers (list) {
      var managers = [];
      angular.forEach(list.managers, function (manager) {
        if (manager._id) {
          managers.push(manager._id);
          return;
        }
        managers.push(manager);
      });
      list.managers = managers;
      return list;
    }

    function formatLabels (list, language) {
      var index =list.labels.map(function(e) { return e.language; }).indexOf(language);
      if (index !== -1) {
       list.labels[index].text =list.label;
       return list;
      }

      list.labels.push({
        text:list.label,
        language: language
      });
      return list;
    }

    function updateList () {
      formatLabels(thisScope.list, thisScope.language);
      formatManagers(thisScope.list);

      thisScope.list.$update(function () {
        thisScope.saving = false;
        $location.path('/lists/' + thisScope.list._id);
      });
    }

    function saveNewList () {
      thisScope.list.labels = [
        {
          text: thisScope.list.label,
          language: thisScope.language
        }
      ];
      List.save(thisScope.list, function (list) {
        thisScope.saving = false;
        $location.path('/lists/' + list._id);
      });
    }

    function listSave () {
      thisScope.saving = true;

      if (thisScope.list._id) {
        updateList();
        return;
      }
      saveNewList();
    }

    thisScope.visibility = [
      {
        value: 'me',
        label: gettextCatalog.getString('The list owner and the managers of this list only')
      },
      {
        value: 'inlist',
        label: gettextCatalog.getString('People on the list only')
      },
      {
        value: 'verified',
        label: gettextCatalog.getString('Verified users only')
      },
      {
        value: 'all',
        label: gettextCatalog.getString('Anyone within Humanitarian ID')
      }
    ];

    thisScope.joinability = [
      {
        value: 'public',
        label: gettextCatalog.getString('Anyone within Humanitarian ID')
      },
      {
        value: 'moderated',
        label: gettextCatalog.getString('Anyone within HID can ask to be checked in')
      },
      {
        value: 'private',
        label: gettextCatalog.getString('Only the owner and managers of the list can add users')
      }
    ];
  }
})();
