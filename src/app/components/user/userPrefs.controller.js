(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserPrefsCtrl', UserPrefsCtrl);

  UserPrefsCtrl.$inject = ['$exceptionHandler', '$scope', '$location', 'AuthService', 'alertService', 'UserDataService'];

  function UserPrefsCtrl($exceptionHandler, $scope, $location, AuthService, alertService, UserDataService) {
    $scope.pendingConnections = [];
    $scope.approvedConnections = [];
    $scope.password = {
      old: '',
      new: ''
    };

    $scope.timezones = moment.tz.names();
    $scope.tabs = {};
    $scope.activeTab = 'connections';

    $scope.toggleTabs = function(tabName) {
      $scope.tabs[tabName] = !$scope.tabs[tabName];
      $scope.activeTab = tabName;
    };
    $scope.tabClass = function (tabName) {
      var classes = [];
      if ($scope.tabs[tabName]) {
        classes.push('mobile-active');
      }
      if ($scope.activeTab === tabName) {
        classes.push('desktop-active');
      }
      return classes;
    };

    UserDataService.getUser($scope.currentUser.id, function () {
      $scope.user = UserDataService.user;
      getConnections($scope.user);
    });

    // Set a new password for the current user
    $scope.savePassword = function(form) {
      $scope.user.old_password = $scope.password.old;
      $scope.user.new_password = $scope.password.new;
      $scope.user.$update(function () {
        alertService.add('success', 'Your password was successfully changed.');
        form.$setPristine();
      }, function (error) {
        alertService.add('danger', 'There was an error saving your password.');
        $exceptionHandler(error, 'savePassword');
        form.$setPristine();
      });
    };

    // Set settings for the current user
    $scope.saveSettings = function () {
      $scope.user.$update(function () {
        alertService.add('success', 'Your settings were successfully changed.');
        $scope.setCurrentUser($scope.user);
        $scope.initLanguage();
      }, function (error) {
        alertService.add('danger', 'There was an error saving your settings.');
        $exceptionHandler(error, 'saveSettings');
      });
    };

    // Delete current user account
    $scope.deleteAccount = function () {
      alertService.add('danger', 'Are you sure you want to do this ? You will not be able to access Humanitarian ID anymore.', true, function() {
        $scope.user.$delete(function () {
          alertService.add('success', 'Your account was successfully removed. You are now logged out. Sorry to have you go.', false, function () {});
          AuthService.logout();
          $scope.removeCurrentUser();
          $location.path('/');
        });
      });
    };

    // Revoke client
    $scope.revokeClient = function (client) {
      alertService.add('danger', 'Are you sure you want to do this ? You will need to authorize this application again to access it through Humanitarian ID.', true, function () {
        var index = -1;
        for (var i = 0, len = $scope.user.authorizedClients.length; i < len; i++) {
          if ($scope.user.authorizedClients[i].id == client.id) {
            index = i;
          }
        }
        if (index != -1) {
          $scope.user.authorizedClients.splice(index, 1);
          $scope.user.$update(function () {
            alertService.add('success', 'Application successfully revoked.');
          }, function (error) {
            alertService.add('danger', 'There was an error revoking this application.');
            $exceptionHandler(error, 'revokeClient');
          });
        }
      });
    };

    function getConnections (user) {
      $scope.pendingConnections = user.connections.filter(function(connection) {
        return connection.pending;
      });

      $scope.approvedConnections = user.connections.filter(function(connection) {
        return !connection.pending;
      });
    }

    $scope.approveConnection = function (connection) {
      $scope.user.approveConnection($scope.user._id, connection._id, function () {
        alertService.add('success', 'Connection approved', false, function () {});
        var index = $scope.user.connections.indexOf(connection);
        $scope.user.connections[index].pending = false;
        getConnections($scope.user);
        $scope.setCurrentUser($scope.user);
      }, function (error) {
        alertService.add('danger', 'Connection could not be approved');
        $exceptionHandler(error, 'approveConnection');
      });
    };

    $scope.removeConnection = function (connection) {
      $scope.user.deleteConnection($scope.user._id, connection._id, function () {
        alertService.add('success', 'Connection removed', false, function () {});
        $scope.user.connections.splice($scope.user.connections.indexOf(connection), 1);
        getConnections($scope.user);
        $scope.setCurrentUser($scope.user);
      }, function (error) {
        alertService.add('danger', 'Connection could not be removed');
        $exceptionHandler(error, 'removeConnection');
      });
    } ;

  }

})();
