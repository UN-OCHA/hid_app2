(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$routeParams', '$timeout', '$location', 'alertService', 'md5', 'UserDataService', 'config', 'gettextCatalog', 'TwoFactorAuthService'];

  function UserCtrl($exceptionHandler, $rootScope, $scope, $routeParams, $timeout, $location, alertService, md5, UserDataService, config, gettextCatalog, TwoFactorAuthService) {
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
    $scope.vcardUrl = '';

    $scope.toggleForm = function () {
      $scope.showProfileForm = !$scope.showProfileForm;
    };
    var showingAuthBanner = false;
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
          if (connection.user && connection.user._id === currentUserId) {
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
      console.log($scope.pictureUrl);
    }

    function showSavedMessage (message) {
      var messageTimer;
      $scope.saving.message = message || 'Profile updated';
      $timeout.cancel(messageTimer);
      messageTimer = $timeout(function () {
        $scope.saving.show = false;
      }, 5000);
    }

    function authUserAlert (user, currentUser) {
      if (user.authOnly && (currentUser.is_admin || currentUser.isManager)) {
        var authMessage = gettextCatalog.getString('This account is currently only visible to global managers. By editing it, you will automatically inform the user that you have created his/her profile and made it visible to everyone on Humanitarian ID.');
        alertService.pageAlert('warning', authMessage, 'caution');
        showingAuthBanner = true;
      }
      /*if (user.authOnly && !currentUser.is_admin && !currentUser.isManager && user.id === currentUser.id) {
        var authMessage = gettextCatalog.getString('Your account is currently not findable by other users. If you would like to allow other users to find you, click on the wheel icon in your profile and click on "Make profile visible"');
        alertService.pageAlert('warning', authMessage, 'caution');
        showingAuthBanner = true;
      }*/
    }

    function setVcardUrl (user) {
      // Export user details to vcard
      var vcardUrl = "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:" + user.family_name + ";" + user.given_name + ";;;\n" +
          "FN:" + user.name + "\n";
      if (user.organization && user.organization.name) {
        vcardUrl += "ORG:" + user.organization.name + "\n";
      }
      if (user.job_title) {
        vcardUrl += "TITLE:" + user.job_title + "\n";
      }
      angular.forEach(user.phone_numbers, function (item) {
        if (item.type && item.number) {
          vcardUrl += "TEL;TYPE=" + item.type + ",VOICE:" + item.number + "\n";
        }
      });
      angular.forEach(user.emails, function (item) {
        if (item.email) {
          vcardUrl += "EMAIL:" + item.email + "\n";
        }
      });
      vcardUrl += "REV:" + new Date().toISOString() + "\n" +
        "END:VCARD\n";
      $scope.vcardUrl = 'data:text/vcard;charset=UTF-8,' + encodeURIComponent(vcardUrl);
    }

    function getUser () {
      var afterUserLoaded = function () {
        $rootScope.title = $scope.user.name;
        userPicture($scope.user.picture, $scope.user.email);
        setConnectionInfo($scope.user, $scope.currentUser._id);
        authUserAlert($scope.user, $scope.currentUser);
        setVcardUrl($scope.user);
        if (!$scope.currentUser.verified && $scope.user.is_orphan) {
          $scope.canViewInfo = false;
          alertService.pageAlert('warning', gettextCatalog.getString('In order to view this person’s profile, please contact info@humanitarian.id'));
        }
        $scope.userLoaded = true;
        $scope.$broadcast('userLoaded');
      };
      // Try to get user from cache first
      UserDataService.getUserFromCache($routeParams.userId)
        .then(function (user) {
          if (user) {
            $scope.user = UserDataService.transformUser(user);
            afterUserLoaded();
          }
          if ($rootScope.isOnline) {
            return UserDataService.getUserFromServer($routeParams.userId);
          }
        })
        .then(function (user) {
          // If online, try to refresh with a fresh copy from server
          if ($rootScope.isOnline && user) {
            UserDataService.cacheUser($routeParams.userId, user);
            $scope.user = UserDataService.transformUser(user);
            afterUserLoaded();
          }
        })
        .catch (function (err) {
          $scope.userLoaded = true;
          $scope.userExists = false;
          $exceptionHandler(err, 'getUser');
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

      if (showingAuthBanner && !$scope.user.authOnly) {
        showingAuthBanner = false;
        alertService.resetPageAlert();
      }
    });

    $scope.notify = function () {
      $scope.user.notify('Test', function () {
        alertService.add('success', gettextCatalog.getString('User was successfully notified'), false, function () {});
      }, function () {
        $exceptionHandler(error, 'User notification error');
      });
    };

    $scope.sendClaimEmail = function () {
      alertService.add('warning', 'Are you sure?', true, function() {
        $scope.user.claimEmail(function () {
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'), false, function () {});
        }, function () {
          $exceptionHandler(error, 'Claim email error');
        });
      });
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
        $exceptionHandler(error, 'Verify user error');
      });
    };

    $scope.flagUser = function () {
      if (!$scope.currentUser.is_admin) {
        return;
      }
      $scope.user.hidden = !$scope.user.hidden;
      $scope.user.$update(function () {
        if ($scope.user.id === $scope.currentUser.id) {
          $scope.setCurrentUser($scope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});
      }, function () {
        $exceptionHandler(error, 'Verify user error');
      });
    };

    $scope.hideUser = function () {
      if (!$scope.currentUser.is_admin && !$scope.currentUser.isManager && $scope.user.id !== $scope.currentUser.id) {
        return;
      }
      $scope.user.authOnly = !$scope.user.authOnly;
      if (showingAuthBanner && !$scope.user.authOnly) {
        showingAuthBanner = false;
        alertService.resetPageAlert();
      }
      if ($scope.user.authOnly) {
        authUserAlert($scope.user, $scope.currentUser);
      }
      $scope.user.$update(function () {
        if ($scope.user.id === $scope.currentUser.id) {
          $scope.setCurrentUser($scope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});

      }, function () {
        $exceptionHandler(error, 'Verify user error');
      });
    }

    $scope.cancel = function () {
      $scope.profileForm.$hide();
      $scope.saving.show = false;
    };

    function sendDeleteRequest (user, token) {
      user.delete(user, function () {
        alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
        $location.path('/landing');
        UserDataService.notify();
      }, function (){}, token);
    }

    $scope.deleteUser = function (user) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.'), true, function() {
        if ($scope.currentUser.totp) {
          TwoFactorAuthService.requestToken(function (token) {
            sendDeleteRequest(user, token);
          }, function () {});
          return
        }
        sendDeleteRequest(user);
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
