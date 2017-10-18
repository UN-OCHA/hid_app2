(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserEditCtrl', UserEditCtrl);

  UserEditCtrl.$inject = ['$exceptionHandler', '$location', '$scope', 'alertService', 'config', 'gettextCatalog', 'hrinfoService', 'List', 'TwoFactorAuth', 'UserCheckInService'];

  function UserEditCtrl($exceptionHandler, $location, $scope, alertService, config, gettextCatalog, hrinfoService, List, TwoFactorAuth, UserCheckInService) {
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
    $scope.setPrimaryLocation = setPrimaryLocation;
    $scope.setPrimaryJobTitle = setPrimaryJobTitle;
    $scope.uploadStatus = '';
    $scope.onUploadSuccess = onUploadSuccess;
    $scope.onUploadError = onUploadError;
    $scope.setPrimaryEmail = setPrimaryEmail;
    $scope.resendValidationEmail = resendValidationEmail;
    $scope.setPrimaryPhone = setPrimaryPhone;
    $scope.updateUser = updateUser;
    $scope.addPrimaryOrg = addPrimaryOrg;
    $scope.addPrimaryLocation = addPrimaryLocation;
    $scope.nextStep = nextStep;
    $scope.currentStep = 1;
    $scope.visibilityOptions = [
      {
        value: 'anyone',
        label: gettextCatalog.getString('Anyone')
      },
      {
        value: 'verified',
        label: gettextCatalog.getString('Verified users')
      },
      {
        value: 'connections',
        label: gettextCatalog.getString('My connections')
      }
    ];
    $scope.urlRegEx = /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/
    var defaultSettings = {};
    var lastStep = 4;
    var primaryEmail = '';

    function getCountries () {
      hrinfoService.getCountries().then(function (countries) {
        $scope.countries = countries;
      });
    }

    function setUpFields () {
      $scope.phoneNumberTypes = [
        {value: '', name: gettextCatalog.getString('Select phone number type')},
        {value: 'Landline', name: gettextCatalog.getString('Landline')},
        {value: 'Mobile', name: gettextCatalog.getString('Mobile')},
        {value: 'Satellite', name: gettextCatalog.getString('Satellite Phone')}
      ];

      $scope.emailTypes = [
        {value: '', name: gettextCatalog.getString('Select email type')},
        {value: 'Work', name: gettextCatalog.getString('Work')},
        {value: 'Personal', name: gettextCatalog.getString('Personal')}
      ];

      $scope.voipTypes = [
        {value: '', name: gettextCatalog.getString('Select social network type')},
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
        phonesVisibility: '',
        emailsVisibility: '',
        locationsVisibility: '',
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
        functional_role: {}
      };
      $scope.temp = angular.copy(defaultSettings);
      angular.copy($scope.user.organization, $scope.organization);
      $scope.temp.phonesVisibility = angular.copy($scope.user.phonesVisibility);
      $scope.temp.emailsVisibility = angular.copy($scope.user.emailsVisibility);
      $scope.temp.locationsVisibility = angular.copy($scope.user.locationsVisibility);
      primaryEmail = $scope.user.email;

      getCountries();
      getRoles();
    }

    function updateCurrentUser () {
      if ($scope.user._id === $scope.currentUser._id) {
        $scope.setCurrentUser($scope.user);
      }
    }

    function addList (list, listType, callback) {
      $scope.$emit('editUser', {status: 'saving'});
      var listId = list.list._id;

      UserCheckInService.save({userId: $scope.user._id, listType: listType}, {list: listId}, function (response) {
        $scope.$parent.user[listType] = angular.copy(response[listType]);

        var newList = $scope.$parent.user[listType].pop();
        $scope.$parent.user[listType].unshift(newList);

        if (listType === 'organizations') {
          var primaryOrg = $scope.$parent.user.organizations.filter(function (org) {
            return org.list === listId;
          })[0];

          setPrimaryOrganization(primaryOrg, function () {
            if (callback) {
              callback();
            }
          });
          return;
        }

        updateCurrentUser();
        var capitalized = listType.charAt(0).toUpperCase() + listType.slice(1);
        $scope.$emit('editUser', {
          status: 'success',
          type: 'add' + capitalized,
          message: capitalized + gettextCatalog.getString(' added')
        });

        if (callback) {
          callback();
        }
      });
    }

    function removeList (listType, listUser) {
      $scope.$emit('editUser', {status: 'saving'});
      UserCheckInService.delete({userId: $scope.user._id, listType: listType + 's', checkInId: listUser._id}, {}, function () {
        updateCurrentUser();
        $scope.$emit('editUser', {status: 'success', message: listType + gettextCatalog.getString(' removed')});
      });
    }

    function saveUpdatedUser (type, callback) {
      $scope.user.$update(function () {
        updateCurrentUser();
        if (type === 'addlocation') {
          $scope.showRegion = false;
        }
        $scope.$emit('editUser', {
          status: 'success',
          type: type,
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }

      }, function (error) {
        $exceptionHandler(error, 'Save updated user error');
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function saveUser (type, callback) {
      $scope.$emit('editUser', {status: 'saving'});
      saveUpdatedUser(type, callback);
    }

    function savePhoneNumber (number, callback) {
      $scope.$emit('editUser', {status: 'saving'});
      $scope.user.addPhone(number, function () {
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'addphone_number',
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Save phone number error');
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function saveEmail (email, callback) {
      $scope.$emit('editUser', {status: 'saving'});
      $scope.user.addEmail(email, function (resp) {
        $scope.user.emails = resp.data.emails;
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'addemail',
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Save email error');
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function isListMember (list, user) {
      var inList = false;
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (list._id === userList.list._id) {
            inList = true;
            return inList;
          }
        });
      });
      return inList;
    }

    function filterLists (lists, user) {
      var filteredLists = lists.filter(function (list) {
        return !isListMember(list, user);
      });
      return filteredLists;
    }

    function getOrganizations(search) {
      List.query({'name': search, 'type': 'organization'}, function (orgs) {
        $scope.organizations = filterLists(orgs, $scope.user);
      });
    }

    function setRegions ($item) {
      if ($scope.temp.location && $scope.temp.location.region) {
        delete $scope.temp.location.region;
      }
      if ($scope.temp.location && $scope.temp.location.locality) {
        delete $scope.temp.location.locality;
      }

      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.showRegion = regions.length ? true : false;
        $scope.regions = regions;
      });
    }

    function getRoles () {
      List.query({'type': 'functional_role'}, function (roles) {
        $scope.roles = filterLists(roles, $scope.user);
      });
    }

    function formatUrl (url) {
      if (url.substring(0,7) !== 'http://' && url.substring(0,8) !== 'https://') {
        return 'http://' + url;
      }
      return url;
    }

    function hasDuplicates (key, user, temp) {
      var duplicates = [];

      if (key === 'location') {
        duplicates = user.locations.filter(function(location) {
          return angular.equals(location, temp.location);
        });
      }

      if (key === 'phone_number') {
        duplicates = user.phone_numbers.filter(function(phone_number) {
          return phone_number.number ===  temp.phone_number.number;
        });
      }

      if (key === 'email') {
        duplicates = user.emails.filter(function(email) {
          return email.email ===  temp.email.email;
        });
      }

      if (key === 'job_title') {
        duplicates = user.job_titles.filter(function(job_title) {
          return job_title ===  temp.job_title;
        });
      }

      if (key === 'website') {
        duplicates = user.websites.filter(function(website) {
          return website.url ===  temp.website.url;
        });
      }

      return duplicates.length ? true : false;
    }

    function addItem (key, callback) {
      if (!$scope.user[key + 's'] || angular.equals($scope.temp[key], defaultSettings[key])) {
        return;
      }

      if (hasDuplicates(key, $scope.user, $scope.temp)) {
        alertService.add('danger', gettextCatalog.getString('Already added'));
        return;
      }

      if (key === 'website') {
        $scope.temp.website.url = formatUrl($scope.temp.website.url);
      }

      if (key === 'email') {
        saveEmail($scope.temp[key]);
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      } else {
        $scope.user[key + 's'].unshift($scope.temp[key]);
      }

      if (key === 'organization' || key === 'functional_role') {
        addList($scope.temp[key], key + 's', callback);
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'phone_number') {
        savePhoneNumber($scope.user[key + 's'][0], function () {
          setPrimaryPhone($scope.user[key + 's'][0]);
        });
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'job_title') {
        saveUser('add' + key, function () {
          setPrimaryJobTitle($scope.user[key + 's'][0]);
        });
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'location') {
        saveUser('add' + key, function () {
          setPrimaryLocation($scope.user[key + 's'][0], callback);
        });
        $scope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      $scope.temp[key] = angular.copy(defaultSettings[key]);
      saveUser('add' + key, callback);
    }

    function dropItem (key, value) {
      if (!$scope.user[key + 's']) {
        return;
      }

      if (config.listTypes.indexOf(key) !== -1) {
        alertService.add('danger', gettextCatalog.getString('Are you sure you want to check out of this list?'), true, function () {
          removeList(key, value);
          $scope.user[key + 's'].splice($scope.user[key + 's'].indexOf(value), 1);
          return;
        });
        return;
      }
      $scope.user[key + 's'].splice($scope.user[key + 's'].indexOf(value), 1);
      saveUser();
    }

    function setPrimaryOrganization (org, callback) {
      $scope.$emit('editUser', {status: 'saving'});
      $scope.user.setPrimaryOrganization(org, function (resp) {
        $scope.user.organization = resp.data.organization;
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'primaryOrganization',
          message: gettextCatalog.getString('Primary organization updated')
        });
        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Set primary organization error');
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function setPrimaryLocation (location, callback) {
      $scope.user.location = angular.copy(location);
      saveUser('primaryLocation', callback);
    }

    function setPrimaryJobTitle (title) {
      $scope.user.job_title = title;
      saveUser('primaryJobTitle');
    }

    function onUploadStart () {
      $scope.uploadStatus = 'uploading';
    }

    function onUploadSuccess (response) {
      $scope.user.picture = response.data.picture;
      $scope.uploadStatus = 'success';
      updateCurrentUser();
      $scope.$emit('editUser', {status: 'success', message: gettextCatalog.getString('Picture uploaded'), type: 'picture'});
    }

    function onUploadError (error) {
      alertService.add('danger', gettextCatalog.getString('There was an error uploading the picture'));
      $scope.uploadStatus = '';
      $exceptionHandler(error, 'Image upload fail');
      $scope.$emit('editUser', {status: 'fail'});
    }

    function setUserPrimaryEmail (email, token) {
      $scope.user.setPrimaryEmail(email, function (resp) {
        $scope.user.email = resp.data.email;
        updateCurrentUser();
        $scope.$emit('editUser', {
          status: 'success',
          type: 'primaryEmail',
          message: gettextCatalog.getString('Primary email updated')
        });
      }, function (error) {
        $exceptionHandler(error, 'Set primary email error');
        $scope.user.email = primaryEmail;
        $scope.$emit('editUser', {status: 'fail'});
      }, token);
    }

    function setPrimaryEmail (email) {
      $scope.$emit('editUser', {status: 'saving'});
      if ($scope.user.totp) {
        TwoFactorAuth.requestToken(function (token) {
          setUserPrimaryEmail(email, token);
        }, function () {
          $scope.user.email = primaryEmail;
          $scope.$emit('editUser', {status: 'fail'});
        });
        return;
      }
      setUserPrimaryEmail(email);
    }

    function resendValidationEmail (email) {
      $scope.user.resendValidationEmail(email, function () {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function (error) {
        $exceptionHandler(error, 'Resend validation email error');
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
      }, function (error) {
        $exceptionHandler(error, 'Set primary phone number error');
        $scope.$emit('editUser', {status: 'fail'});
      });
    }

    function updateUser (item) {
      if (item === '') {
        return;
      }
      saveUser();
    }

    function addPrimaryOrg () {
      if (!Object.keys($scope.temp.organization).length) {
        nextStep();
        return;
      }
      addItem('organization', nextStep);
    }

    function addPrimaryLocation () {
      if (!Object.keys($scope.temp.location).length) {
        nextStep();
        return;
      }
      addItem('location', nextStep);
    }

    function nextStep () {
      if ($scope.currentStep === lastStep) {
        $location.path('/tutorial');
        return;
      }
      $scope.currentStep = $scope.currentStep + 1;
    }

    $scope.changePermission = function (key) {
      $scope.user[key] = $scope.temp[key];
      saveUser(key);
    };

    //Wait until user is loaded into scope by parent controller
    $scope.$on('userLoaded', function () {
      setUpFields();
    });

  }

})();
