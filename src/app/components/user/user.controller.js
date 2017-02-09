(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$timeout', '$location', 'alertService', 'md5', 'User', 'UserDataService', 'config'];

  function UserCtrl($exceptionHandler, $scope, $routeParams, $timeout, $location, alertService, md5, User, UserDataService, config) {
    $scope.pictureUrl = '';
    $scope.userLoaded = false;
    $scope.canEditUser = ($routeParams.userId === $scope.currentUser._id) || $scope.currentUser.is_admin || $scope.currentUser.isManager;
    $scope.showProfileForm  = $routeParams.edit && $scope.canEditUser ? true : false;
    $scope.saving = {
      status: '',
      message: '',
      show: false
    };
    $scope.apiUrl = config.apiUrl;
    $scope.showRequestPhoneConnection = false;
    $scope.connectionInfo = {
      phonesPermission: '',
      emailsPermission: '',
      locationsPermission: ''
    }

    $scope.toggleForm = function () {
      $scope.showProfileForm = !$scope.showProfileForm;
    };

    function getPermission(value, pending, permission) {
      if (value !== null) {
        return 'view';
      }
      return (pending && permission === 'connections') ? 'pending' : permission;
    }

    function setConnectionInfo (user, currentUserId) {

     var connectionPending = false;
     if (user.connections) {
        angular.forEach(user.connections, function (connection) {
          if (connection.user === currentUserId) {
            if (connection.pending) {
              connectionPending = true;
            }
          }
        });
      }

      $scope.connectionInfo.phonesPermission = getPermission(user.phone_number, connectionPending, user.phonesVisibility);
      $scope.connectionInfo.emailsPermission = getPermission(user.email, connectionPending, user.emailsVisibility);
      $scope.connectionInfo.locationsPermission = getPermission(user.location, connectionPending, user.locationsVisibility);    
    }

    function userPicture (picture, email) {
      var emailHash = '';
      if (picture) {
        $scope.pictureUrl = picture;
        return;
      }
      if (!email) { return; }
      emailHash = md5.createHash(email.trim().toLowerCase());
      $scope.pictureUrl = 'https://secure.gravatar.com/avatar/' + emailHash + '?s=200';
    }

    function showSavedMessage (message) {
      var messageTimer;
      $scope.saving.message = message || 'Profile updated';
      $timeout.cancel(messageTimer);
      messageTimer = $timeout(function () {
        $scope.saving.show = false;
      }, 5000);
    }

    UserDataService.getUser($routeParams.userId, function () {
      $scope.user = UserDataService.user;
      userPicture($scope.user.picture, $scope.user.email);
      setConnectionInfo($scope.user, $scope.currentUser._id);
      $scope.userLoaded = true;
      $scope.$broadcast('userLoaded');
    }, function (error) {
      $exceptionHandler(error, 'getUser');
    });

    //Listen for user edited event
    $scope.$on('editUser', function (event, data) {
      if (data.status === 'saving') {
        $scope.saving.show = true;
        $scope.saving.status = 'saving';
        return;
      }

      if (data.status === 'fail') {
        $scope.saving.show = false;
        return;
      }

      if (data.type === 'picture') {
        $scope.pictureUrl = $scope.user.picture;
      }

      $scope.saving.status = data.status;
      showSavedMessage(data.message);
      UserDataService.formatUserLocations();
    });

    $scope.notify = function () {
      $scope.user.notify('Test', function () {
        alertService.add('success', 'User was successfully notified');
      }, function () {
        alertService.add('danger', 'There was an error notifying this user');
      });
    };

    $scope.sendClaimEmail = function () {
      alertService.add('warning', 'Are you sure?', true, function() {
        $scope.user.claimEmail(function () {
          alertService.add('success', 'Claim email sent successfully');
        }, function () {
          alertService.add('danger', 'There was an error sending the claim email');
        });
      });
    };

    // Export user details to vcard
    $scope.exportVcard = function () {
      var vcard = "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        "N:" + $scope.user.family_name + ";" + $scope.user.given_name + ";;;\n" +
        "FN:" + $scope.user.name + "\n";
      if ($scope.user.organization && $scope.user.organization.name) {
        vcard += "ORG:" + $scope.user.organization.name + "\n";
      }
      if ($scope.user.job_title) {
        vcard += "TITLE:" + $scope.user.job_title + "\n";
      }
      if ($scope.user.phone_number) {
        vcard += "TEL;";
        if ($scope.user.phone_number_type) {
          vcard += "TYPE=" + $scope.user.phone_number_type+",";
        }
        vcard += "VOICE:" + $scope.user.phone_number + "\n";
      }
      angular.forEach($scope.user.phone_numbers, function (item) {
        if (item.type && item.number) {
          vcard += "TEL;TYPE=" + item.type + ",VOICE:" + item.number + "\n";
        }
      });
      if ($scope.user.email) {
        vcard += "EMAIL:" + $scope.user.email + "\n";
      }
      angular.forEach($scope.user.emails, function (item) {
        if (item.email) {
          vcard += "EMAIL:" + item.email + "\n";
        }
      });
      vcard += "REV:" + new Date().toISOString() + "\n" +
        "END:VCARD\n";
      window.location.href = 'data:text/vcard;charset=UTF-8,' + encodeURIComponent(vcard);
    };

    $scope.verifyUser = function () {
      if (!$scope.currentUser.is_admin || $scope.currentUser.isManager) {
        return;
      }
      $scope.user.verified = !$scope.user.verified;
      $scope.user.$update(function () {
        if ($scope.user.id === $scope.currentUser.id) {
          $scope.setCurrentUser($scope.user);
        }
        alertService.add('success', 'User updated');
      }, function () {
        alertService.add('danger', 'There was an error updating this user');
      });
    };

    $scope.cancel = function () {
      $scope.profileForm.$hide();
      $scope.saving.show = false;
    };

    $scope.deleteUser = function (user) {
      alertService.add('danger', 'Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.', true, function() {
        user.$delete(function () {
          alertService.add('success', 'The user was successfully deleted.');
          $location.path('/landing');
        });
      });
    };

    $scope.requestConnection = function () {
      $scope.user.requestConnection($scope.user._id, function () {
        alertService.add('success', 'Connection request sent');
        $scope.connectionInfo.phonesPermission = 'pending';
      }, function (error) {
        $exceptionHandler(error, 'requestConnection');
      })
    }
  }
})();
