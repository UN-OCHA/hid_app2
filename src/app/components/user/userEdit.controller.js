(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserEditCtrl', UserEditCtrl);

  UserEditCtrl.$inject = ['$scope', 'alertService', 'gettextCatalog', 'hrinfoService', 'List', 'User', 'UserCheckInService'];

  function UserEditCtrl($scope, alertService, gettextCatalog, hrinfoService, List, User, UserCheckInService) {
    $scope.phoneNumberTypes = [];
    $scope.emailTypes = [];
    $scope.voipTypes = [];
    $scope.regions = [];
    $scope.countries = [];
    $scope.temp = {};
    $scope.organization = {};
    $scope.showRegion = false;
    $scope.getOrganizations = getOrganizations;
    $scope.getCountries = getCountries;
    $scope.setRegions = setRegions;
    $scope.addItem = addItem;
    $scope.dropItem = dropItem;
    $scope.setPrimaryOrganization = setPrimaryOrganization;
    $scope.getLocationId = getLocationId;
    $scope.isPrimaryLocation  = isPrimaryLocation;
    $scope.setPrimaryLocation = setPrimaryLocation;
    $scope.setPrimaryJobTitle = setPrimaryJobTitle;
    $scope.onUploadSuccess = onUploadSuccess;
    $scope.onUploadError = onUploadError;
    $scope.setPrimaryEmail = setPrimaryEmail;
    $scope.resendValidationEmail = resendValidationEmail;
    $scope.setPrimaryPhone = setPrimaryPhone;
    $scope.updateUser = updateUser;
    var defaultSettings = {};

    function getRoles () {
      $scope.roles = List.query({'type': 'functional_role'});
    }

    function getCountries () {
      hrinfoService.getCountries().then(function (countries) {
        $scope.countries = countries;
      });
    }

    function setUpFields () {
      $scope.phoneNumberTypes = [
        {value: 'Landline', name: 'Landline'},
        {value: 'Mobile', name: 'Mobile'},
        {value: 'Satellite', name: 'Satellite Phone'}
      ];

      $scope.emailTypes = [
        {value: 'Work', name: 'Work'},
        {value: 'Personal', name: 'Personal'}
      ];

      $scope.voipTypes = [
        {value: 'Skype', name: 'Skype'},
        {value: 'Google', name: 'Google'}
      ];

      defaultSettings = {
        email: {
          type: '',
          email: ''
        },
        phone_number: {
          type: '',
          number: '1'
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
      angular.copy($scope.user.organization, $scope.organization);
      $scope.primaryLocationId = getLocationId($scope.user.location);

      getCountries();
      getRoles();
    }

    function updateCurrentUser () {
      if ($scope.user._id === $scope.currentUser._id) {
        $scope.setCurrentUser($scope.currentUser);
      }
    }

    function addList (list, listType) {
      $scope.$emit('editUser', {status: 'saving'});
      UserCheckInService.save({userId: $scope.user._id, listType: listType}, {list: list.list._id}, function (response) {
        $scope.user[listType] = angular.copy(response[listType]);
        updateCurrentUser();
        var capitalized = listType.charAt(0).toUpperCase() + listType.slice(1);
        $scope.$emit('editUser', {
          status: 'success',
          type: 'add' + capitalized,
          message: capitalized + gettextCatalog.getString(' added')
        });
      });
    }

    function removeList (listType, listUser) {
      $scope.$emit('editUser', {status: 'saving'});
      UserCheckInService.delete({userId: $scope.user._id, listType: listType + 's', checkInId: listUser._id}, {}, function () {
        updateCurrentUser();
        $scope.$emit('editUser', {status: 'success', message: listType + gettextCatalog.getString(' removed')});
      });
    }

    function checkinAndSave (type) {
      UserCheckInService.save({userId: $scope.user._id, listType: 'organization'}, {list: $scope.organization.list._id}, function () {
        saveUpdatedUser(type);
      });
    }

    function saveUpdatedUser (type) {
      $scope.user.$update(function (user) {
        $scope.$parent.user = angular.copy(user);
        updateCurrentUser();
        $scope.showRegion = false;
        $scope.$emit('editUser', {
          status: 'success',
          type: type,
          message: gettextCatalog.getString('Profile updated')
        });

        if (type === 'primaryLocation') {
          $scope.primaryLocationId = getLocationId($scope.user.location);
        }

      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error saving the profile'));
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function saveUser (type) {
      $scope.$emit('editUser', {status: 'saving'});

      if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
        if ($scope.user.organization.list) {
          // Check out from the old organization
          UserCheckInService.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function () {
            checkinAndSave(type);
          });
        }
        else {
          // Check into the new organization
          checkinAndSave(type);
        }
      }
      else {
        saveUpdatedUser(type);
      }
    }

    function getOrganizations(search) {
      $scope.organizations = List.query({'name': search, 'type': 'organization'});
    }

    function setRegions ($item) {
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.showRegion = regions.length ? true : false
        $scope.regions = regions;
      });
    }

    function addItem (key) {
      if (!$scope.user[key + 's'] || angular.equals($scope.temp[key], defaultSettings[key])) {
        return;
      }

      $scope.user[key + 's'].push($scope.temp[key]);

      if (key === 'organization' || key === 'functional_role') {
        addList($scope.temp[key], key + 's');
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }
      $scope.temp[key] = angular.copy(defaultSettings[key]);
      saveUser('add' + key);
    }

    function dropItem (key, value) {
      if (!$scope.user[key + 's']) {
        return;
      }
      $scope.user[key + 's'].splice($scope.user[key + 's'].indexOf(value), 1);

      if (key === 'organization' || key === 'functional_role') {
        removeList(key, value);
        return;
      }

      saveUser();
    }

    function setPrimaryOrganization (org) {
      $scope.$emit('editUser', {status: 'saving'});
      $scope.user.setPrimaryOrganization(org, function (resp) {
        $scope.user.organization = resp.data.organization;
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'primaryOrganization',
          message: gettextCatalog.getString('Primary organization updated')
        });
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary organization.'));
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    //Create an id for each location so can use as radio buttons
    function getLocationId (location) {
      if (!location) {
        return;
      }
      var id = location.country.id;
      if (location.region) {
        id += '-' + location.region.id;
      }
      return id;
    }


    function isPrimaryLocation (location, primaryLocation) {
      if (!primaryLocation || (location.country.id !== primaryLocation.country.id)) {
        return false;
      }
      if (location.region && primaryLocation.region) {
        if (location.region.id !== primaryLocation.region.id) {
          return false;
        }
      }
      return true;
    }

    function setPrimaryLocation (location) {
      $scope.user.location = angular.copy(location);
      saveUser('primaryLocation');
    }

    function setPrimaryJobTitle (title) {
      $scope.user.job_title = title;
      saveUser('primaryJobTitle');
    }

    function onUploadSuccess (resp) {
      $scope.user.picture = resp.data.picture;
      updateCurrentUser();
      $scope.$emit('editUser', {status: 'success', message: gettextCatalog.getString('Picture uploaded'), type: 'picture'});
    }

    function onUploadError () {
      alertService.add('danger', gettextCatalog.getString('There was an error uploading the picture'));
      $scope.$emit('editUser', {status: 'fail'});
    }

    function setPrimaryEmail (email) {
      $scope.$emit('editUser', {status: 'saving'});
      $scope.user.setPrimaryEmail(email, function (resp) {
        $scope.user.email = resp.data.email;
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'primaryEmail',
          message: gettextCatalog.getString('Primary email updated')
        });
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error setting your primary email.'));
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function resendValidationEmail (email) {
      $scope.user.resendValidationEmail(email, function () {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error sending the validation email.'));
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function setPrimaryPhone (phone) {
      $scope.$emit('editUser', {status: 'saving'});

      $scope.user.setPrimaryPhone(phone.number, function (resp) {
        $scope.user.phone_number = resp.data.phone_number;
        updateCurrentUser();
        $scope.$emit('editUser', {
          type: 'primaryPhone',
          status: 'success',
          message: gettextCatalog.getString('Primary phone number updated')
        });
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary phone number.'));
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function updateUser (item) {
      if (item === '') {
        return;
      }
      saveUser();
    }

    //Wait until user is loaded into scope by parent controller
    $scope.$on('userLoaded', function () {
      setUpFields();
    });

  }

})();
