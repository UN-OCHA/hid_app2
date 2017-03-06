(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListEditCtrl', ListEditCtrl);

  ListEditCtrl.$inject = ['$scope', '$routeParams', '$location', 'List', 'User', 'gettextCatalog'];

  function ListEditCtrl($scope, $routeParams, $location, List, User, gettextCatalog) {
    $scope.saving = false;
    $scope.newManagers = [];
    $scope.visibility = [];
    $scope.joinability = [];
    $scope.listSave = listSave;
    $scope.getManagers = getManagers;

    initList();

    function initList () {
      if ($routeParams.list) {
        $scope.list = List.get({'listId': $routeParams.list});
        return;
      }
      $scope.list = new List();
      $scope.list.type = 'list';
    }

    function getManagers (search) {
      if (search === '') {
        return;
      }
      $scope.newManagers = User.query({name: search});
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
      formatLabels($scope.list, $scope.language);
      formatManagers($scope.list);

      $scope.list.$update(function () {
        $scope.saving = false;
        $location.path('/lists/' + $scope.list._id);
      });
    }

    function saveNewList () {
      $scope.list.labels = [
        {
          text: $scope.list.label,
          language: $scope.language
        }
      ]; 
      List.save($scope.list, function (list) {
        $scope.saving = false;
        $location.path('/lists/' + list._id);
      });
    }

    function listSave () {
      $scope.saving = true;

      if ($scope.list._id) {
        updateList();
        return;
      }
      saveNewList();
    }

    $scope.visibility = [
      {
        value: 'me',
        label: gettextCatalog.getString('The list owner and editors of this list only')
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

    $scope.joinability = [
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
