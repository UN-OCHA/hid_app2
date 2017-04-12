(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$timeout', '$location', 'alertService', 'md5', 'UserDataService', 'config', 'gettextCatalog'];

  function UserCtrl($exceptionHandler, $scope, $routeParams, $timeout, $location, alertService, md5, UserDataService, config, gettextCatalog) {
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
    $scope.connectionInfo = {
      canRequestConnection: false,
      phonesPermission: '',
      emailsPermission: '',
      locationsPermission: ''
    };
    $scope.canViewInfo = true;
    $scope.userExists = true;

    $scope.toggleForm = function () {
      $scope.showProfileForm = !$scope.showProfileForm;
    };

    var permissionsMessage;
    var connectionRequired = false;
    var verifiedRequired = false;
    var connectionRequiredMessage = gettextCatalog.getString('Please note that some of the information made available by this user is private. You can contact them with a request to see their whole profile by clicking \'Connect\'.');
    var connectionPendingMessage = gettextCatalog.getString('Your connection request is pending');
    var verifiedRequiredMessage = gettextCatalog.getString('Please note that some of the information made available by this user is only available to verified users');
    var connectionAndVerifiedMessage = gettextCatalog.getString('Please note that some of the information made available by this user is private and some is available only to verified users. You can contact them with a request to see the private sections of their profile by clicking \'Connect\'.');
    var pendingAndVerifiedMessage = gettextCatalog.getString('Your connection request is pending. Please note that some of the information made available by this user is only available to verified users.');

    function getPermission (value, pending, permission) {
      if (value !== null) {
        return 'view';
      }
      if (permission === 'connections') {
        connectionRequired = true;
      }
      if (permission === 'verified') {
        verifiedRequired = true;
      }
      return (pending && permission === 'connections') ? 'pending' : permission;
    }

    function getPermissionMessage (connectionPending, connectionRequired, verifiedRequired) {
      if (connectionPending) {
        if (verifiedRequired) {
          return pendingAndVerifiedMessage;
        }
        return connectionPendingMessage;
      }

      if (connectionRequired) {
        if (verifiedRequired) {
          return connectionAndVerifiedMessage;
        }
        return connectionRequiredMessage;
      }

      if (verifiedRequired ) {
        return verifiedRequiredMessage;
      }
    }

    function setConnectionInfo (user, currentUserId) {
     var connectionPending = false;
     $scope.connectionInfo.canRequestConnection = false;

     if (user.connections) {
        angular.forEach(user.connections, function (connection) {
          if (connection.user._id === currentUserId) {
            if (connection.pending) {
              connectionPending = true;
            }
          }
        });
      }

      $scope.connectionInfo.phonesPermission = getPermission(user.phone_number, connectionPending, user.phonesVisibility);
      $scope.connectionInfo.emailsPermission = getPermission(user.email, connectionPending, user.emailsVisibility);
      $scope.connectionInfo.locationsPermission = getPermission(user.location, connectionPending, user.locationsVisibility);  
      $scope.connectionInfo.canRequestConnection = connectionRequired && !connectionPending;
      permissionsMessage = getPermissionMessage(connectionPending, connectionRequired, verifiedRequired);

      if (permissionsMessage) {
        alertService.pageAlert('warning', permissionsMessage, 'caution');
      }
    }

    function userPicture (picture, email) {
      var emailHash = '';
      var defaultImage = '/img/default-avatar.png';
      var defaultImagePath = $location.protocol() + '://' + $location.host() + defaultImage;
      if (Offline.state !== 'up' || (!picture && !email)) {
        $scope.pictureUrl = defaultImage;
        return;
      }
      if (picture) {
        $scope.pictureUrl = picture;
        return;
      }
      emailHash = md5.createHash(email.trim().toLowerCase());
      $scope.pictureUrl = 'https://secure.gravatar.com/avatar/' + emailHash + '?s=200&d=' + defaultImagePath;
    }

    function showSavedMessage (message) {
      var messageTimer;
      $scope.saving.message = message || 'Profile updated';
      $timeout.cancel(messageTimer);
      messageTimer = $timeout(function () {
        $scope.saving.show = false;
      }, 5000);
    }

    function getUser () {
      UserDataService.getUser($routeParams.userId, function () {
        $scope.user = UserDataService.user;
        userPicture($scope.user.picture, $scope.user.email);
        setConnectionInfo($scope.user, $scope.currentUser._id);
        if (!$scope.currentUser.verified && $scope.user.is_orphan) {
          $scope.canViewInfo = false;
          alertService.pageAlert('warning', gettextCatalog.getString('In order to view this person’s profile, please contact info@humanitarian.id'));
        }
        $scope.userLoaded = true;
        $scope.$broadcast('userLoaded');
      }, function (error) {
        $scope.userLoaded = true;
        $scope.userExists = false;
        $exceptionHandler(error, 'getUser');
      });
    }
    getUser();

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
        alertService.add('success', gettextCatalog.getString('User was successfully notified'), false, function () {});
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error notifying this user'));
      });
    };

    $scope.sendClaimEmail = function () {
      alertService.add('warning', 'Are you sure?', true, function() {
        $scope.user.claimEmail(function () {
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'), false, function () {});
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error sending the claim email'));
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
      if (!$scope.currentUser.is_admin && !$scope.currentUser.isManager) {
        return;
      }
      $scope.user.verified = !$scope.user.verified;
      $scope.user.$update(function () {
        if ($scope.user.id === $scope.currentUser.id) {
          $scope.setCurrentUser($scope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error updating this user'));
      });
    };

    $scope.cancel = function () {
      $scope.profileForm.$hide();
      $scope.saving.show = false;
    };

    $scope.deleteUser = function (user) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.'), true, function() {
        user.$delete(function () {
          alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'), false, function () {});
          $location.path('/landing');
        });
      });
    };

    $scope.requestConnection = function () {
      $scope.user.requestConnection($scope.user._id, function () {
        alertService.add('success', gettextCatalog.getString('Connection request sent'), false, function () {});
        alertService.resetPageAlert();
        getUser();
      }, function (error) {
        $exceptionHandler(error, 'requestConnection');
      });
    };
  }
})();
