(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', '$routeParams', '$http', '$timeout', '$window', 'gettextCatalog', 'alertService', 'hrinfoService', 'md5', 'config', 'User', 'List', 'UserCheckInService'];

  function UserCtrl($scope, $routeParams, $http, $timeout, $window, gettextCatalog, alertService, hrinfoService, md5, config, User, List, UserCheckInService) {

    var defaultSettings = {
      email: {
        type: '',
        email: ''
      },
      phone_number: {
        type: '',
        number: ''
      },
      voip: {
        type: '',
        username: ''
      },
      organization: {},
      job_title: '',
      location: {},
      website: {
        url: ''
      },
      role: {}
    };
    $scope.temp = angular.copy(defaultSettings);
    $scope.phoneNumberTypes = [
      {value: 'Landline', name: 'Landline'},
      {value: 'Mobile', name: 'Mobile'}
    ];

    $scope.emailTypes = [
      {value: 'Work', name: 'Work'},
      {value: 'Personal', name: 'Personal'}
    ];

    $scope.voipTypes = [
      {value: 'Skype', name: 'Skype'},
      {value: 'Google', name: 'Google'}
    ];
    $scope.roles = [];
    $scope.saving = {
      status: '',
      message: '',
      show: false
    };

    $scope.organization = {};
    $scope.pictureUrl = '';

    $scope.canEditUser = ($routeParams.userId == $scope.currentUser.id || $scope.currentUser.is_admin);

    $scope.user = User.get({userId: $routeParams.userId}, function(user) {
      if (user.picture) {
        $scope.pictureUrl = user.picture;
      }
      else {
        var userEmail = md5.createHash(user.email.trim().toLowerCase());
        $scope.pictureUrl = 'https://secure.gravatar.com/avatar/' + userEmail + '?s=200';
      }
      angular.copy(user.organization, $scope.organization);
    });

    $scope.countries = [];
    hrinfoService.getCountries().then(function (countries) {
      $scope.countries = countries;
    });

    $scope.regions = [];
    $scope.setRegions = function ($item) {
      $scope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.regions = regions;
      });
    };

    $scope.resendValidationEmail = function (email) {
      $scope.user.resendValidationEmail(email, function () {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error sending the validation email.'));
      });
    };

    $scope.notify = function () {
      $scope.user.notify('Test', function () {
        alertService.add('success', gettextCatalog.getString('User was successfully notified'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error notifying this user'));
      });
    };

    $scope.addItem = function (key) {
      if (!$scope.user[key + 's']) {
        return;
      }
      if (angular.equals($scope.temp[key], defaultSettings[key])) {
        return;
      }

      $scope.user[key + 's'].push($scope.temp[key]);

      if (key === 'organization') {
        addOrganization($scope.temp.organization);
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }
      $scope.temp[key] = angular.copy(defaultSettings[key]);
      $scope.saveUser();
    };

    $scope.dropItem = function (key, value){
      if (!$scope.user[key + 's']) {
        return;
      }
      $scope.user[key + 's'].splice($scope.user[key + 's'].indexOf(value), 1);

      if (key === 'organization') {
        removeOrganization(value);
        return;
      }

      $scope.saveUser();
    };


    var hrinfoResponse = function (response) {
      var out = [];
      angular.forEach(response.data.data, function (value, key) {
        this.push({
          id: key,
          name: value
        });
      }, out);
      return out;
    };

    $scope.getOrganizations = function(search) {
      $scope.organizations = List.query({'name': search, 'type': 'organization'});
    };

    $scope.getDisasters = function(val) {
      return $http.get(config.hrinfoUrl + '/disasters?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
        .then(hrinfoResponse);
    };

    $scope.getLists = function (val) {
      return $http.get(config.apiUrl + 'lists', { params: { where: { name: { contains: val } } } })
        .then(function (response) {
          return response.data;
        });
    };

    $scope.getLocations = function (val) {
      return $http.get(config.hrinfoUrl + '/locations?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
        .then(hrinfoResponse);
    };


    $scope.getRoles = function () {
      return hrinfoService.getRoles().then(function (data) {
        $scope.roles = data;
      });
    };
    $scope.getRoles();

    $scope.setPrimaryOrganization = function (org) {
      $scope.saving.status = 'saving';
      $scope.saving.show = true;
      $scope.user.setPrimaryOrganization(org, function (resp) {
        $scope.user.organization = resp.data.organization;
        if ($scope.user._id === $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.saving.status = 'success';
        showSavedMessage(gettextCatalog.getString('Primary organization updated'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary organization.'));
      });
    };

    function addOrganization (org) {
      $scope.saving.status = 'saving';
      $scope.saving.show = true;
      UserCheckInService.save({userId: $scope.user._id, listType: 'organizations'}, {list: org.list._id}, function () {
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.saving.status = 'success';
        showSavedMessage(gettextCatalog.getString('Organization added'));
      });
    }

    function removeOrganization (org) {
      $scope.saving.status = 'saving';
      $scope.saving.show = true;
      UserCheckInService.delete({userId: $scope.user._id, listType: 'organizations', checkInId: org._id}, {}, function () {
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.saving.status = 'success';
        showSavedMessage(gettextCatalog.getString('Organization removed'));
      });
    }

    //Create an id for each location so can use as radio buttons
    $scope.getLocationId = function (location) {
      if (!location) {
        return;
      }
      var id = location.country.id;
      if (location.region) {
        id += '-' + location.region.id;
      }
      return id;
    }
    $scope.primaryLocationId = $scope.getLocationId($scope.user.location);

    $scope.isPrimaryLocation = function (location, primaryLocation) {
      if (location.country.id !== primaryLocation.country.id) {
        return false;
      }
      if (location.region && primaryLocation.region) {
        if (location.region.id !== primaryLocation.region.id) {
          return false;
        }
      }
      return true;
    }

    $scope.setPrimaryLocation = function (location) {
      $scope.user.location = angular.copy(location);
      $scope.saveUser();
    }

    $scope.setPrimaryJobTitle = function (title) {
      $scope.user.job_title = title;
      $scope.saveUser()
    };

    function showSavedMessage (message) {
      $scope.saving.message = message || 'Profile updated';
      $timeout(function () {
        $scope.saving.show = false;
      }, 5000);
    }

    $scope._checkinAndSave = function() {
      UserCheckInService.save({userId: $scope.user._id, listType: 'organization'}, {list: $scope.organization.list._id}, function () {
        $scope._saveUser();
      });
    };
    $scope._saveUser = function () {
      $scope.user.$update(function (user) {
        //  Update the currentUser item in localStorage if the current user is the one being saved
        if (user.id == $scope.currentUser.id) {
          $scope.setCurrentUser(user);
        }
        $scope.saving.status = 'success';
        showSavedMessage();
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error: ') + resp.data.error);
      });
    };

    $scope.saveUser = function() {
      $scope.saving.status = 'saving';
      $scope.saving.show = true;

      if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
        if ($scope.user.organization.list) {
          // Check out from the old organization
          UserCheckInService.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function () {
            $scope._checkinAndSave();
          });
        }
        else {
          // Check into the new organization
          $scope._checkinAndSave();
        }
      }
      else {
        $scope._saveUser();
      }
    };

    $scope.onUploadSuccess = function (resp) {
      $scope.saving.status = 'saving';
      $scope.saving.show = true;
      $scope.pictureUrl = resp.data.picture;
      $scope.user.picture = resp.data.picture;
      if (resp.data._id == $scope.currentUser._id) {
        $scope.setCurrentUser($scope.user);
      }
      $scope.saving.status('success');
      showSavedMessage('Picture uploaded');
    };

    $scope.onUploadError = function () {
      alertService.add('danger', gettextCatalog.getString('There was an error uploading the picture'));
    };

    $scope.setOrganization = function (data, index) {
      $scope.user.organizations[index] = data;
    };

    // Send claim email
    $scope.sendClaimEmail = function () {
      alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.user.claimEmail(function () {
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'));
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error sending the claim email'));
        });
      });
    };

    $scope.setPrimaryEmail = function (email) {
      $scope.saving.show = true;
      $scope.saving.status = 'saving';
      $scope.user.setPrimaryEmail(email, function (resp) {
        $scope.user.email = resp.data.email;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.saving.status = 'success';
        showSavedMessage(gettextCatalog.getString('Primary email updated'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error setting your primary email.'));
      });
    };

    $scope.setPrimaryPhone = function (phone) {
      $scope.saving.show = true;
      $scope.saving.status = 'saving';
      $scope.user.setPrimaryPhone(phone.number, function (resp) {
        $scope.user.phone_number = resp.data.phone_number;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.saving.status = 'success';
        showSavedMessage(gettextCatalog.getString('Primary phone number updated'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary phone number.'));
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
      $scope.saveUser();
    };

    $scope.cancel = function () {
      $scope.profile.form.$hide();
      $scope.saving.show = false;
    }

    $scope.updateUser = function (item) {
      if (item === '') {
        return;
      }
      $scope.saveUser();
    }

  }
})();
