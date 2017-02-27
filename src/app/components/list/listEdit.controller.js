(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListEditCtrl', ListEditCtrl);

  ListEditCtrl.$inject = ['$scope', '$routeParams', '$location', 'List', 'User', 'gettextCatalog'];

  function ListEditCtrl($scope, $routeParams, $location, List, User, gettextCatalog) {
    $scope.saving = false;
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

    if ($routeParams.list) {
      $scope.list = List.get({'listId': $routeParams.list});
    }
    else {
      $scope.list = new List();
      $scope.list.type = 'list';
    }

    // Retrieve managers
    $scope.getManagers = function(search) {
      if (search === '') {
        return;
      }
      $scope.newManagers = User.query({'name': search});
    };

    // Save list settings
    $scope.listSave = function() {
      $scope.saving = true;

      if ($scope.list._id) {
        var index = $scope.list.labels.map(function(e) { return e.language; }).indexOf($scope.language);
        $scope.list.labels[index].text = $scope.list.label;
        $scope.list.$update();
        $scope.list.$promise.then(function() {
          $scope.saving = false;
          $location.path('/lists/' + $scope.list._id);
        });
      }
      else {
        $scope.saving = true;
        $scope.list.labels = [
          {
            text: $scope.list.label,
            language: $scope.language
          }
        ]; 

        $scope.list = List.save($scope.list);
        $scope.list.$promise.then(function() {
          $scope.saving = false;
          $location.path('/lists/' + $scope.list._id);
        });
      }
    };
  }
})();
