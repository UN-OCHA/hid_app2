(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'hrinfoService', 'md5', 'config', 'User', 'List', 'UserCheckIn'];

  function UserCtrl($scope, $routeParams, $http, $window, gettextCatalog, alertService, hrinfoService, md5, config, User, List, UserCheckIn) {

    $scope.newEmail = {
      type: '',
      email: ''
    };
    $scope.newPhoneNumber = {
      type: '',
      number: ''
    };
    $scope.newLocation = {
      location: {
        id: '',
        name: ''
      }
    };
    $scope.newVoip = {
      type: '',
      username: ''
    };
    $scope.newOrganization = {};
    $scope.newJobTitle = '';

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
    $scope.setRegions = function ($item, $model) {
      $scope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.regions = regions;
      });
    };

    $scope.resendValidationEmail = function (email) {
      $scope.user.resendValidationEmail(email, function (resp) {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error sending the validation email.'));
      });
    };

    $scope.setPrimaryEmail = function (email) {
      $scope.user.setPrimaryEmail(email, function (resp) {
        alertService.add('success', gettextCatalog.getString('Primary email successfully changed'));
        $scope.user.email = resp.data.email;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error setting your primary email.'));
      });
    };

    $scope.addEmail = function () {
      $scope.user.addEmail($scope.newEmail, function (resp) {
        alertService.add('success', gettextCatalog.getString('Email added successfully. You will need to validate it.'));
        $scope.user.emails = resp.data.emails;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.newEmail = {};
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this email.'));
        $scope.newEmail = {};
      });
    };

    $scope.dropEmail = function (email) {
      $scope.user.dropEmail(email, function (resp) {
        alertService.add('success', gettextCatalog.getString('Email removed successfully.'));
        $scope.user.emails = resp.data.emails;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.newEmail = {};
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this email.'));
        $scope.newEmail = {};
      });
    };

    $scope.addPhone = function () {
      $scope.user.addPhone($scope.newPhoneNumber, function (resp) {
        alertService.add('success', gettextCatalog.getString('Phone number added successfully.'));
        $scope.user.phone_numbers = resp.data.phone_numbers;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
        $scope.newPhoneNumber = {};
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this phone number.'));
        $scope.newPhoneNumber = {};
      });
    };

    $scope.dropPhone = function (id) {
      $scope.user.dropPhone(id, function (resp) {
        alertService.add('success', gettextCatalog.getString('Phone number removed successfully.'));
        $scope.user.phone_numbers = resp.data.phone_numbers;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error removing this phone number.'));
      });
    };

    $scope.setPrimaryPhone = function (phone) {
      $scope.user.setPrimaryPhone(phone.number, function (resp) {
        alertService.add('success', gettextCatalog.getString('Primary phone number set successfully'));
        $scope.user.phone_number = resp.data.phone_number;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary phone number.'));
      });
    };

    $scope.addVoip = function () {
      $scope.user.voips.push($scope.newVoip);
    };

    $scope.addJobTitle = function () {
      $scope.user.job_titles.push($scope.newJobTitle);
    };

    $scope.addOrganization = function() {
      UserCheckIn.save({userId: $scope.user._id, listType: 'organizations'}, {list: $scope.newOrganization.list._id}, function (user) {
        $scope.user.organizations = user.organizations;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
      });
    };

    $scope.removeOrganization = function(org) {
      UserCheckIn.delete({userId: $scope.user._id, listType: 'organizations', checkInId: org._id}, {}, function (user) {
        $scope.user.organizations = user.organizations;
        if ($scope.user._id == $scope.currentUser._id) {
          $scope.setCurrentUser($scope.currentUser);
        }
      });
    };

    $scope.notify = function () {
      $scope.user.notify('Test', function (resp) {
        alertService.add('success', gettextCatalog.getString('User was successfully notified'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error notifying this user'));
      });
    };

    $scope.addItem = function (key) {
      if (!$scope.user[key]) {
        $scope.user[key] = [];
      }
      switch (key) {
        case 'websites':
          $scope.user[key].unshift({url: ''});
          break;
        case 'voips':
          $scope.user[key].unshift({ type: 'Skype', username: '' });
          break;
        case 'phone_numbers':
          $scope.user[key].unshift($scope.newPhoneNumber);
          break;
        case 'emails':
          $scope.user[key].unshift($scope.newEmail);
          break;
        case 'locations':
          $scope.user[key].unshift({country: '', region: ''});
          break;
        case 'job_titles':
          $scope.user[key].unshift('');
          break;
        case 'organizations':
          $scope.user[key].unshift({id: '', name: ''});
          break;
      }
    };

    $scope.dropItem = function (key, index ){
      $scope.user[key].splice(index, 1);
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

    $scope.roles = [];
    $scope.getRoles = function () {
      return hrinfoService.getRoles().then(function (d) {
        $scope.roles = d;
      });
    };

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

    $scope._checkinAndSave = function() {
      UserCheckIn.save({userId: $scope.user._id, listType: 'organization'}, {list: $scope.organization.list._id}, function (user) {
        $scope._saveUser();
      });
    };
    $scope._saveUser = function () {
      $scope.user.$update(function (user, response) {
        //  Update the currentUser item in localStorage if the current user is the one being saved
        if (user.id == $scope.currentUser.id) {
          $scope.setCurrentUser(user);
        }
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error: ') + resp.data.error);
      });
    };

    $scope.saveUser = function() {
      if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
        if ($scope.user.organization.list) {
          // Check out from the old organization
          UserCheckIn.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function (user) {
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
      $scope.pictureUrl = resp.data.picture;
      $scope.user.picture = resp.data.picture;
      if (resp.data._id == $scope.currentUser._id) {
        $scope.setCurrentUser($scope.user);
      }
    };

    $scope.onUploadError = function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error uploading the picture'));
    };

    $scope.setOrganization = function (data, index) {
      $scope.user.organizations[index] = data;
    };

    // Send claim email
    $scope.sendClaimEmail = function () {
      var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
        $scope.user.claimEmail(function (response) {
          alert.closeConfirm();
          alertService.add('success', gettextCatalog.getString('Claim email sent successfully'));
        }, function (response) {
          alert.closeConfirm();
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
    }

  }
})();
