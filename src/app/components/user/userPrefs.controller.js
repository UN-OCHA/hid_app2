(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserPrefsCtrl', UserPrefsCtrl);

  UserPrefsCtrl.$inject = ['$scope', '$location', 'gettextCatalog', 'moment', 'AuthService', 'alertService', 'User'];

  function UserPrefsCtrl($scope, $location, gettextCatalog, moment, AuthService, alertService, User) {

    $scope.password = {
      old: '',
      new: ''
    };

    $scope.timezones = moment.tz.names();


    $scope.user = User.get({userId: $scope.currentUser.id}, function(user) {
    });

    // Set a new password for the current user
    $scope.savePassword = function(form) {
      $scope.user.old_password = $scope.password.old;
      $scope.user.new_password = $scope.password.new;
      $scope.user.$update(function (user) {
        alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
        form.$setPristine();
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error saving your password.'));
        form.$setPristine();
      });
    };

    // Set settings for the current user
    $scope.saveSettings = function (form) {
      $scope.user.$update(function (user) {
        alertService.add('success', gettextCatalog.getString('Your settings were successfully changed.'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error saving your settings.'));
      });
    };

    // Delete current user account
    $scope.deleteAccount = function (lu) {
      var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will not be able to access Humanitarian ID anymore.'), true, function() {
        User.delete({id: $scope.user.id}, function (out) {
          alert.closeConfirm();
          alertService.add('success', gettextCatalog.getString('Your account was successfully removed. You are now logged out. Sorry to have you go.'));
          AuthService.logout();
          $scope.removeCurrentUser();
          $location.path('/');
        });
      });
    };

    // Revoke client
    $scope.revokeClient = function (client) {
      var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will need to authorize this application again to access it through Humanitarian ID.'), true, function () {
        var index = -1;
        for (var i = 0, len = $scope.user.authorizedClients.length; i < len; i++) {
          if ($scope.user.authorizedClients[i].id == client.id) {
            index = i;
          }
        }
        if (index != -1) {
          $scope.user.authorizedClients.splice(index, 1);
          $scope.user.$update(function (user) {
            alert.closeConfirm();
            alertService.add('success', gettextCatalog.getString('Application successfully revoked.'));
          }, function (resp) {
            alert.closeConfirm();
            alertService.add('danger', gettextCatalog.getString('There was an error revoking this application.'));
          });
        }
        else {
          alert.closeConfirm();
        }
      });
    };

  }

})();
