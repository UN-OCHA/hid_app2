(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserOptionsCtrl', UserOptionsCtrl);

  UserOptionsCtrl.$inject = ['$exceptionHandler', '$scope', '$uibModal', 'alertService', 'config', 'List', 'ListDataService', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];

  function UserOptionsCtrl($exceptionHandler, $scope, $uibModal, alertService, config, List, ListDataService, UserCheckInService, UserDataService, gettextCatalog) {
    $scope.deleteUser = deleteUser;
    $scope.verifyUser = verifyUser;
    $scope.removeFromList = removeFromList;

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
        $exceptionHandler(error, 'Verify user form user options');
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

  }

})();
