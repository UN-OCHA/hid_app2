(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', '$routeParams', '$timeout', '$location', '$localForage', 'gettextCatalog', 'alertService', 'md5', 'User', 'config'];

  function UserCtrl($scope, $routeParams, $timeout, $location, $localForage, gettextCatalog, alertService, md5, User, config) {
    $scope.pictureUrl = '';
    $scope.canEditUser = ($routeParams.userId == $scope.currentUser.id || $scope.currentUser.is_admin || $scope.currentUser.isManager);
    $scope.showProfileForm  = $routeParams.edit && $scope.canEditUser ? true : false;
    $scope.saving = {
      status: '',
      message: '',
      show: false
    };
    $scope.apiUrl = config.apiUrl;

    $scope.toggleForm = function () {
      $scope.showProfileForm = !$scope.showProfileForm;
    };

    function userPicture (picture, email) {
      var emailHash = '';
      if (picture) {
        $scope.pictureUrl = picture;
        return;
      }
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

    function getPrimaryIndex (type, object, primary) {
      if (type === 'phone') {
        return object.map(function (phoneNumber) {
          return phoneNumber.number;
        }).indexOf(primary);
      }

      if (type === 'email') {
        return object.map(function (email) {
          return email.email;
        }).indexOf(primary);
      }

      if (type === 'organization') {
        return object.map(function (org) {
          return org.list;
        }).indexOf(primary.list);
      }

      if (type === 'jobTitle') {
        return object.indexOf(primary);
      }

      if (type === 'location') {
        var primaryIndex;
        angular.forEach(object, function (location, index) {
          if (angular.equals(location, primary)) {
            primaryIndex = index;
          }
        });
        return primaryIndex;
      }
    }

    function orderByPrimary (type, object, primary) {
      if (!primary) {
        return object;
      }

      var primaryIndex = getPrimaryIndex(type, object, primary);
      var primaryObject = object.splice(primaryIndex,1)[0];

      if (primaryIndex !== -1 && primaryObject) {
        object.splice(0, 0, primaryObject);
      }
      return object;
    }

    function orderPrimaryFields (user) {
      orderByPrimary('location', user.locations, user.location);
      orderByPrimary('email', user.emails, user.email);
      orderByPrimary('phone', user.phone_numbers, user.phone_number);
      orderByPrimary('organization', user.organizations, user.organization);
      orderByPrimary('jobTitle', user.job_titles, user.job_title);
    }

    function loadUser (user) {
      $scope.user = user;
      orderPrimaryFields($scope.user);
      userPicture(user.picture, user.email);
      $scope.$broadcast('userLoaded');
    }

    User.get({userId: $routeParams.userId}).$promise.then(function (user) {
      $localForage.setItem('user/' + user.id, user);
      loadUser(user);
    })
    .catch(function (err) {
      $localForage.getItem('user/' + $routeParams.userId).then(function (user) {
        console.log('pulled from cache');
        loadUser(user);
      });
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
    });

    $scope.notify = function () {
      $scope.user.notify('Test', function () {
        alertService.add('success', gettextCatalog.getString('User was successfully notified'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error notifying this user'));
      });
    };

    $scope.sendClaimEmail = function () {
      alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.user.claimEmail(function () {
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'));
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
      $scope.user.verified = !$scope.user.verified;
      $scope.user.$update(function () {
        if ($scope.user.id === $scope.currentUser.id) {
          $scope.setCurrentUser($scope.user);
        }
        alertService.add('success', gettextCatalog.getString('User updated'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error updating this user'));
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

  }
})();
