(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('ListEditCtrl', ListEditCtrl);

  ListEditCtrl.$inject = ['$scope', '$routeParams', '$location', 'List', 'User'];

  function ListEditCtrl($scope, $routeParams, $location, List, User) {

    $scope.visibility = [
      {
        value: 'me',
        label: 'List owner and editors only'
      },
      {
        value: 'inlist',
        label: 'People on the list only'
      },
      {
        value: 'all',
        label: 'Anyone within Humanitarian ID'
      },
      {
        value: 'verified',
        label: 'Verified users only'
      }
    ];

    $scope.joinability = [
      {
        value: 'public',
        label: 'Anyone within Humanitarian ID'
      },
      {
        value: 'moderated',
        label: 'Anyone within Humanitarian ID can ask to join'
      },
      {
        value: 'private',
        label: 'Only the owner and managers can add users'
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
      $scope.newManagers = User.query({'name': search});
    };

    // Save list settings
    $scope.listSave = function() {
      if ($scope.list._id) {
        $scope.list.$update();
        $scope.list.$promise.then(function() {
          $location.path('/lists/' + $scope.list._id);
        });
      }
      else {
        $scope.list.label = $scope.list.name;
        $scope.list = List.save($scope.list);
        $scope.list.$promise.then(function() {
          $location.path('/lists/' + $scope.list._id);
        });
      }
    };
  }
})();
