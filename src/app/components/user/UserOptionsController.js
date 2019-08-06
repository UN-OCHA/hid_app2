(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserOptionsController', UserOptionsController);

  UserOptionsController.$inject = ['$exceptionHandler', '$scope', '$uibModal', 'alertService', 'config', 'List', 'ListDataService', 'TwoFactorAuthService', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];

  function UserOptionsController($exceptionHandler, $scope, $uibModal, alertService, config, List, ListDataService, TwoFactorAuthService, UserCheckInService, UserDataService, gettextCatalog) {
    $scope.deleteUser = deleteUser;
    $scope.verifyUser = verifyUser;
    $scope.removeFromList = removeFromList;

    function sendDeleteRequest (user, token) {
      user.delete(user, function () {
        alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
        UserDataService.notify();
      }, function (){}, token);
    }

    function deleteUser (user) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.'), true, function() {
        if ($scope.currentUser.totp) {
          TwoFactorAuthService.requestToken(function (token) {
            sendDeleteRequest(user, token);
          }, function () {});
          return;
        }
        sendDeleteRequest(user);
      });
    }

    function verifyUser (user) {
      user.verified = !user.verified;
      user.$update(function () {
        alertService.add('success', gettextCatalog.getString('User updated'));
      }, function (error) {
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
