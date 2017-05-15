(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserOptionsCtrl', UserOptionsCtrl);

  UserOptionsCtrl.$inject = ['$exceptionHandler', '$scope', '$uibModal', 'alertService', 'config', 'List', 'ListDataService', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];

  function UserOptionsCtrl($exceptionHandler, $scope, $uibModal, alertService, config, List, ListDataService, UserCheckInService, UserDataService, gettextCatalog) {
    var checkInModal;
    $scope.selectedLists = [];
    $scope.availableLists = [];
    $scope.hasLists = true;
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
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.'), true, function() {
        user.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
          UserDataService.notify();
        });
      });
    }

    function verifyUser (user) {
      user.verified = !user.verified;
      user.$update(function () {
        alertService.add('success', gettextCatalog.getString('User updated'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error updating this user'));
      });
    }

    function removeFromList (user, list) {
      var listType = list.type + 's';

      alertService.add('warning', 'Are you sure?', true, function () {
        var checkInId;

        angular.forEach(user[listType], function (userList) {
          if (list._id === userList.list) {
            checkInId = userList._id;
          }
        });
        if (checkInId) {
          UserCheckInService.delete({userId: user._id, listType: listType, checkInId: checkInId}, {}, function () {
            alertService.add('success', gettextCatalog.getString('The user was successfully checked out.'));
            UserDataService.notify();
          }, function (error) {
            $exceptionHandler(error, 'Remove from list fail');
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

    function isListMember (list, user) {
      var inList = false;
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (list._id === userList.list) {
            inList = true;
            return inList;
          }
        });
      });
      return inList;
    }

    function isSelected (selectedLists, list) {
      var listSelected = false;
      angular.forEach(selectedLists, function(selectedList) {
        if (list._id === selectedList._id) {
          listSelected = true;
          return listSelected;
        }
      });
      return listSelected;
    }

    function filterLists (lists, selectedLists, user) {
      var filteredLists = lists.filter(function (list) {
        return !isListMember(list, user) && !isSelected(selectedLists, list);
      });
      return filteredLists;
    }

    function getAvailableLists (currentUser, user, searchTerm) {
      if (currentUser.is_admin || currentUser.isManager) {
        List.query({name: searchTerm, limit: 50, sort: 'name'}, function (lists) {
          $scope.availableLists = filterLists(lists, $scope.selectedLists, user);
        });
        return;
      }
      ListDataService.getManagedAndOwnedLists(currentUser, searchTerm, function (lists) {
        $scope.availableLists = filterLists(lists, $scope.selectedLists, user);
        if (!lists.length) {
          $scope.hasLists = false;
        }
      });
    }

    function checkInToLists (user) {
      angular.forEach($scope.selectedLists, function (list) {
        checkInModal.close();
        UserCheckInService.save({userId: user._id, listType: list.type + 's'}, {list: list._id}, function () {
          alertService.add('success', gettextCatalog.getString('Successfully checked in to list'));
          UserDataService.notify();
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error checking in this user'));
        });
      });
    }

    function openCheckInModal () {
      checkInModal = $uibModal.open({
        animation: false,
        scope: $scope,
        size: 'sm',
        templateUrl: 'app/components/user/checkInToListModal.html',
        controller: function () {
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

