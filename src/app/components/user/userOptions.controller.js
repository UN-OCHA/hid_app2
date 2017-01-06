(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserOptionsCtrl', UserOptionsCtrl);

  UserOptionsCtrl.$inject = ['$scope', '$uibModal', 'alertService', 'config', 'List', 'ListDataService', 'UserCheckInService', 'UserDataService'];

  function UserOptionsCtrl($scope, $uibModal, alertService, config, List, ListDataService, UserCheckInService, UserDataService, User) {
    var checkInModal;
    $scope.selectedLists = [];
    $scope.availableLists = [];
    $scope.deleteUser = deleteUser;
    $scope.verifyUser = verifyUser;
    $scope.removeFromList = removeFromList;
    $scope.closeCheckInModal = closeCheckInModal;
    $scope.openCheckInModal = openCheckInModal;
    $scope.removeSelectedList = removeSelectedList;
    $scope.updateSelectedLists = updateSelectedLists;
    $scope.isSelected = isSelected;
    $scope.checkInToLists = checkInToLists;
    $scope.getAvailableLists = getAvailableLists;

    function deleteUser (user) {
      alertService.add('danger', 'Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.', true, function() {
        user.$delete(function () {
          alertService.add('success', 'The user was successfully deleted.');
          getUsers();
        });
      });
    }

    function verifyUser (user) {
      user.verified = !user.verified;
      user.$update(function () {
        alertService.add('success', 'User updated');
      }, function () {
        alertService.add('danger', 'There was an error updating this user');
      });
    }

    function removeFromList (user, list) {
      var alert = alertService.add('warning', 'Are you sure?', true, function () {
        var checkInId = 0;
        for (var i = 0, len = user[list.type + 's'].length; i < len; i++) {
          if (angular.equals(list._id, user[list.type + 's'][i].list._id)) {
            checkInId = user[list.type + 's'][i]._id;
          }
        }
        if (checkInId !== 0) {
          UserCheckInService.delete({userId: user._id, listType: list.type + 's', checkInId: checkInId}, {}, function() {
            alertService.add('success', 'The user was successfully checked out.');
            UserDataService.notify();
          });
        }
      });
    }

    function closeCheckInModal () {
      checkInModal.close();
    }

    function removeSelectedList (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    }
    
    function updateSelectedLists (list) {
      $scope.selectedLists.push(list);
    }

    function isSelected (list, user) {
      var isInList = false;
      if ($scope.selectedLists.indexOf(list) !== -1) {
        return true;
      }

      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (value) {
          if (list._id === value.list._id) {
            isInList = true;
            return;
          }
        });
      });

      if (isInList) {
        return true;
      }
    }

    function getAvailableLists (isAdmin) {
      if (isAdmin) {
        ListDataService.getManagedAndOwnedLists($scope.currentUser, function (lists) {
          $scope.availableLists = lists;
        });
        return;
      }

      List.query({'owner': $scope.currentUser._id}, function (data) {
        $scope.availableLists = angular.copy(data);
      });
    }

    function checkInToLists (user) {
      angular.forEach($scope.selectedLists, function (list) {
        checkInModal.close();
        UserCheckInService.save({userId: user._id, listType: list.type + 's'}, {list: list._id}, function () {
          alertService.add('success', 'Successfully checked in to list');
          UserDataService.notify();
        }, function () {
          alertService.add('danger', 'There was an error checking in this user');
        });
      });
    }

    function openCheckInModal (user, isAdmin) {
      checkInModal = $uibModal.open({
        animation: false,
        scope: $scope,
        size: 'sm',
        templateUrl: 'app/components/user/checkInToListModal.html',
        controller: function () {
          getAvailableLists(isAdmin);
          return;
        }
      });

      checkInModal.result.then(function () {
        return;
      }, function () {
        return;
      });
    }

  }

})();
   