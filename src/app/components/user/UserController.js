(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserController', UserController);

  UserController.$inject = ['$exceptionHandler', '$rootScope', '$scope', '$routeParams', '$timeout', '$location', 'alertService', 'md5', 'UserDataService', 'config', 'gettextCatalog', 'TwoFactorAuthService'];

  function UserController($exceptionHandler, $rootScope, $scope, $routeParams, $timeout, $location, alertService, md5, UserDataService, config, gettextCatalog, TwoFactorAuthService) {
    var thisScope = $scope;

    thisScope.pictureUrl = '';
    thisScope.userLoaded = false;
    thisScope.canEditUser = ($routeParams.userId === thisScope.currentUser._id) || thisScope.currentUser.is_admin || thisScope.currentUser.isManager;
    thisScope.showProfileForm  = $routeParams.edit && thisScope.canEditUser ? true : false;
    thisScope.saving = {
      status: '',
      message: '',
      show: false
    };
    thisScope.apiUrl = config.apiUrl;
    thisScope.connectionInfo = {
      canRequestConnection: false,
      phonesPermission: '',
      emailsPermission: '',
      locationsPermission: ''
    };
    thisScope.canViewInfo = true;
    thisScope.userExists = true;
    thisScope.vcardUrl = '';

    thisScope.toggleForm = function () {
      thisScope.showProfileForm = !thisScope.showProfileForm;
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
     thisScope.connectionInfo.canRequestConnection = false;

     if (user.connections) {
        angular.forEach(user.connections, function (connection) {
          if (connection.user && connection.user._id === currentUserId) {
            if (connection.pending) {
              connectionPending = true;
            }
          }
        });
      }

      thisScope.connectionInfo.phonesPermission = getPermission(user.phone_number, connectionPending, user.phonesVisibility);
      thisScope.connectionInfo.emailsPermission = getPermission(user.email, connectionPending, user.emailsVisibility);
      thisScope.connectionInfo.locationsPermission = getPermission(user.location, connectionPending, user.locationsVisibility);
      thisScope.connectionInfo.canRequestConnection = connectionRequired && !connectionPending;
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
        thisScope.pictureUrl = defaultImage;
        return;
      }
      if (picture) {
        thisScope.pictureUrl = picture;
        return;
      }
      emailHash = md5.createHash(email.trim().toLowerCase());
      thisScope.pictureUrl = 'https://secure.gravatar.com/avatar/' + emailHash + '?s=200&d=' + defaultImagePath;
      console.log(thisScope.pictureUrl);
    }

    function showSavedMessage (message) {
      var messageTimer;
      thisScope.saving.message = message || 'Profile updated';
      $timeout.cancel(messageTimer);
      messageTimer = $timeout(function () {
        thisScope.saving.show = false;
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
      thisScope.vcardUrl = 'data:text/vcard;charset=UTF-8,' + encodeURIComponent(vcardUrl);
    }

    function getUser () {
      var afterUserLoaded = function () {
        $rootScope.title = thisScope.user.name;
        userPicture(thisScope.user.picture, thisScope.user.email);
        setConnectionInfo(thisScope.user, thisScope.currentUser._id);
        authUserAlert(thisScope.user, thisScope.currentUser);
        setVcardUrl(thisScope.user);
        dedupeAuthorizedClients(thisScope.user.authorizedClients);
        if (!thisScope.currentUser.verified && thisScope.user.is_orphan) {
          thisScope.canViewInfo = false;
          alertService.pageAlert('warning', gettextCatalog.getString('In order to view this person’s profile, please contact info@humanitarian.id'));
        }
        thisScope.userLoaded = true;
        thisScope.$broadcast('userLoaded');
      };
      // Try to get user from cache first
      UserDataService.getUserFromCache($routeParams.userId)
        .then(function (user) {
          if (user) {
            thisScope.user = UserDataService.transformUser(user);
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
            thisScope.user = UserDataService.transformUser(user);
            afterUserLoaded();
          }
        })
        .catch (function (err) {
          thisScope.userLoaded = true;
          thisScope.userExists = false;
          $exceptionHandler(err, 'getUser');
        });
    }
    getUser();

    function dedupeAuthorizedClients(clients) {
      thisScope.user.authorizedClients = clients.filter(function dedupe(client, index, self) {
        var firstIndexFound = self.findIndex(function (c) {
          return c._id === client._id && c.name === client.name;
        });
        return firstIndexFound === index;
      });
    }

    //Listen for user edited event
    thisScope.$on('editUser', function (event, data) {
      if (data.status === 'saving') {
        thisScope.saving.show = true;
        thisScope.saving.status = 'saving';
        return;
      }

      if (data.status === 'fail') {
        thisScope.saving.show = false;
        return;
      }

      if (data.type === 'picture') {
        thisScope.pictureUrl = thisScope.user.picture;
      }

      thisScope.saving.status = data.status;
      showSavedMessage(data.message);
      UserDataService.formatUserLocations();

      if (showingAuthBanner && !thisScope.user.authOnly) {
        showingAuthBanner = false;
        alertService.resetPageAlert();
      }
    });

    thisScope.notify = function () {
      thisScope.user.notify('Test', function () {
        alertService.add('success', gettextCatalog.getString('User was successfully notified'), false, function () {});
      }, function () {
        $exceptionHandler(error, 'User notification error');
      });
    };

    thisScope.sendClaimEmail = function () {
      alertService.add('warning', 'Are you sure?', true, function() {
        thisScope.user.claimEmail(function () {
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'), false, function () {});
        }, function () {
          $exceptionHandler(error, 'Claim email error');
        });
      });
    };

    thisScope.verifyUser = function () {
      if (!thisScope.currentUser.is_admin && !thisScope.currentUser.isManager) {
        return;
      }
      thisScope.user.verified = !thisScope.user.verified;
      thisScope.user.$update(function () {
        if (thisScope.user.id === thisScope.currentUser.id) {
          thisScope.setCurrentUser(thisScope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});
      }, function () {
        $exceptionHandler(error, 'Verify user error');
      });
    };

    thisScope.flagUser = function () {
      if (!thisScope.currentUser.is_admin) {
        return;
      }
      thisScope.user.hidden = !thisScope.user.hidden;
      thisScope.user.$update(function () {
        if (thisScope.user.id === thisScope.currentUser.id) {
          thisScope.setCurrentUser(thisScope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});
      }, function () {
        $exceptionHandler(error, 'Verify user error');
      });
    };

    thisScope.hideUser = function () {
      if (!thisScope.currentUser.is_admin && !thisScope.currentUser.isManager && thisScope.user.id !== thisScope.currentUser.id) {
        return;
      }
      thisScope.user.authOnly = !thisScope.user.authOnly;
      if (showingAuthBanner && !thisScope.user.authOnly) {
        showingAuthBanner = false;
        alertService.resetPageAlert();
      }
      if (thisScope.user.authOnly) {
        authUserAlert(thisScope.user, thisScope.currentUser);
      }
      thisScope.user.$update(function () {
        if (thisScope.user.id === thisScope.currentUser.id) {
          thisScope.setCurrentUser(thisScope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'), false, function () {});

      }, function () {
        $exceptionHandler(error, 'Verify user error');
      });
    }

    thisScope.cancel = function () {
      thisScope.profileForm.$hide();
      thisScope.saving.show = false;
    };

    function sendDeleteRequest (user, token) {
      user.delete(user, function () {
        alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
        $location.path('/landing');
        UserDataService.notify();
      }, function (){}, token);
    }

    thisScope.deleteUser = function (user) {
      alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.'), true, function() {
        if (thisScope.currentUser.totp) {
          TwoFactorAuthService.requestToken(function (token) {
            sendDeleteRequest(user, token);
          }, function () {});
          return
        }
        sendDeleteRequest(user);
      });
    };

    thisScope.requestConnection = function () {
      thisScope.user.requestConnection(thisScope.user._id, function () {
        alertService.add('success', gettextCatalog.getString('Connection request sent'), false, function () {});
        alertService.resetPageAlert();
        getUser();
      }, function (error) {
        $exceptionHandler(error, 'requestConnection');
      });
    };
  }
})();
