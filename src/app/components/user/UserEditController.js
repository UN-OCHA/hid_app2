(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserEditController', UserEditController);

  UserEditController.$inject = ['$exceptionHandler', '$location', '$scope', 'alertService', 'config', 'gettextCatalog', 'hrinfoService', 'List', 'TwoFactorAuthService', 'UserCheckInService'];

  function UserEditController($exceptionHandler, $location, $scope, alertService, config, gettextCatalog, hrinfoService, List, TwoFactorAuthService, UserCheckInService) {
    var thisScope = $scope;

    thisScope.phoneNumberTypes = [];
    thisScope.emailTypes = [];
    thisScope.voipTypes = [];
    thisScope.regions = [];
    thisScope.countries = [];
    thisScope.temp = {};
    thisScope.organization = {};
    thisScope.showRegion = false;
    thisScope.getOrganizations = getOrganizations;
    thisScope.getCountries = getCountries;
    thisScope.setRegions = setRegions;
    thisScope.addItem = addItem;
    thisScope.dropItem = dropItem;
    thisScope.dropPhoneNumber = dropPhoneNumber;
    thisScope.setPrimaryOrganization = setPrimaryOrganization;
    thisScope.setPrimaryLocation = setPrimaryLocation;
    thisScope.setPrimaryJobTitle = setPrimaryJobTitle;
    thisScope.uploadStatus = '';
    thisScope.onUploadSuccess = onUploadSuccess;
    thisScope.onUploadError = onUploadError;
    thisScope.deletePicture = deletePicture;
    thisScope.setPrimaryEmail = setPrimaryEmail;
    thisScope.resendValidationEmail = resendValidationEmail;
    thisScope.setPrimaryPhone = setPrimaryPhone;
    thisScope.updateUser = updateUser;
    thisScope.addPrimaryOrg = addPrimaryOrg;
    thisScope.addPrimaryLocation = addPrimaryLocation;
    thisScope.makeVisible = makeVisible;
    thisScope.nextStep = nextStep;
    thisScope.currentStep = 1;
    thisScope.visibilityOptions = [
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
    thisScope.urlRegEx = /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/
    var defaultSettings = {};
    var lastStep = 4;
    var primaryEmail = '';

    function getCountries () {
      hrinfoService.getCountries().then(function (countries) {
        thisScope.countries = countries;
      });
    }

    function setUpFields () {
      thisScope.phoneNumberTypes = [
        {value: '', name: gettextCatalog.getString('Select phone number type')},
        {value: 'Landline', name: gettextCatalog.getString('Landline')},
        {value: 'Mobile', name: gettextCatalog.getString('Mobile')},
        {value: 'Satellite', name: gettextCatalog.getString('Satellite Phone')}
      ];

      thisScope.emailTypes = [
        {value: '', name: gettextCatalog.getString('Select email type')},
        {value: 'Work', name: gettextCatalog.getString('Work')},
        {value: 'Personal', name: gettextCatalog.getString('Personal')}
      ];

      thisScope.voipTypes = [
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
      thisScope.temp = angular.copy(defaultSettings);
      angular.copy(thisScope.user.organization, thisScope.organization);
      thisScope.temp.phonesVisibility = angular.copy(thisScope.user.phonesVisibility);
      thisScope.temp.emailsVisibility = angular.copy(thisScope.user.emailsVisibility);
      thisScope.temp.locationsVisibility = angular.copy(thisScope.user.locationsVisibility);
      primaryEmail = thisScope.user.email;

      getCountries();
      getRoles();
    }

    function updateCurrentUser () {
      if (thisScope.user._id === thisScope.currentUser._id) {
        thisScope.setCurrentUser(thisScope.user);
      }
    }

    function addList (list, listType, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      var listId = list.list._id;

      UserCheckInService.save({userId: thisScope.user._id, listType: listType}, {list: listId}, function (response) {
        thisScope.$parent.user[listType] = angular.copy(response[listType]);

        var newList = thisScope.$parent.user[listType].pop();
        thisScope.$parent.user[listType].unshift(newList);

        if (listType === 'organizations') {
          var primaryOrg = thisScope.$parent.user.organizations.filter(function (org) {
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
        thisScope.$emit('editUser', {
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
      thisScope.$emit('editUser', {status: 'saving'});
      UserCheckInService.delete({userId: thisScope.user._id, listType: listType + 's', checkInId: listUser._id}, {}, function () {
        updateCurrentUser();
        thisScope.$emit('editUser', {status: 'success', message: listType + gettextCatalog.getString(' removed')});
      });
    }

    function saveUpdatedUser (type, callback) {
      thisScope.user.$update(function () {
        updateCurrentUser();
        if (type === 'addlocation') {
          thisScope.showRegion = false;
        }
        thisScope.$emit('editUser', {
          status: 'success',
          type: type,
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }

      }, function (error) {
        $exceptionHandler(error, 'Save updated user error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function saveUser (type, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      saveUpdatedUser(type, callback);
    }

    function savePhoneNumber (number, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      thisScope.user.addPhone(number, function () {
        updateCurrentUser();
        thisScope.$emit('editUser', {
          status: 'success',
          type: 'addphone_number',
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Save phone number error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function saveEmail (email, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      thisScope.user.addEmail(email, function (resp) {
        thisScope.user.emails = resp.data.emails;
        updateCurrentUser();
        thisScope.$emit('editUser', {
          status: 'success',
          type: 'addemail',
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Save email error');
        thisScope.$emit('editUser', {status: 'fail'});
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
      if (search) {
        List.query({'name': search, 'type': 'organization'}, function (orgs) {
          thisScope.organizations = filterLists(orgs, thisScope.user);
        });
      }
      else {
        thisScope.organizations = [];
      }
    }

    function setRegions ($item) {
      if (thisScope.temp.location && thisScope.temp.location.region) {
        delete thisScope.temp.location.region;
      }
      if (thisScope.temp.location && thisScope.temp.location.locality) {
        delete thisScope.temp.location.locality;
      }

      hrinfoService.getRegions($item.id).then(function (regions) {
        thisScope.showRegion = regions.length ? true : false;
        thisScope.regions = regions;
      });
    }

    function getRoles () {
      thisScope.roles = filterLists(List.roles, thisScope.user);
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
      if (!thisScope.user[key + 's'] || angular.equals(thisScope.temp[key], defaultSettings[key])) {
        return;
      }

      if (hasDuplicates(key, thisScope.user, thisScope.temp)) {
        alertService.add('danger', gettextCatalog.getString('Already added'));
        return;
      }

      if (key === 'website') {
        thisScope.temp.website.url = formatUrl(thisScope.temp.website.url);
      }

      if (key === 'email') {
        saveEmail(thisScope.temp[key]);
        thisScope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      } else {
        thisScope.user[key + 's'].unshift(thisScope.temp[key]);
      }

      if (key === 'organization' || key === 'functional_role') {
        addList(thisScope.temp[key], key + 's', callback);
        thisScope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'phone_number') {
        savePhoneNumber(thisScope.user[key + 's'][0], function () {
          setPrimaryPhone(thisScope.user[key + 's'][0]);
        });
        thisScope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'job_title') {
        saveUser('add' + key, function () {
          setPrimaryJobTitle(thisScope.user[key + 's'][0]);
        });
        thisScope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      if (key === 'location') {
        saveUser('add' + key, function () {
          setPrimaryLocation(thisScope.user[key + 's'][0], callback);
        });
        thisScope.temp[key] = angular.copy(defaultSettings[key]);
        return;
      }

      thisScope.temp[key] = angular.copy(defaultSettings[key]);
      saveUser('add' + key, callback);
    }

    function dropItem (key, value) {
      if (!thisScope.user[key + 's']) {
        return;
      }

      if (config.listTypes.indexOf(key) !== -1) {
        alertService.add('danger', gettextCatalog.getString('Are you sure you want to check out of this list?'), true, function () {
          removeList(key, value);
          thisScope.user[key + 's'].splice(thisScope.user[key + 's'].indexOf(value), 1);
          return;
        });
        return;
      }
      thisScope.user[key + 's'].splice(thisScope.user[key + 's'].indexOf(value), 1);
      saveUser();
    }

    function dropPhoneNumber (id, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      thisScope.user.dropPhone(id, function (resp) {
        thisScope.user.phone_numbers = resp.data.phone_numbers;
        thisScope.user.phone_number = resp.data.phone_number;
        thisScope.user.phone_number_type = resp.data.phone_number_type;
        updateCurrentUser();
        thisScope.$emit('editUser', {
          status: 'success',
          type: 'dropphone_number',
          message: gettextCatalog.getString('Profile updated')
        });

        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Drop phone number error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function setPrimaryOrganization (org, callback) {
      thisScope.$emit('editUser', {status: 'saving'});
      thisScope.user.setPrimaryOrganization(org, function (resp) {
        thisScope.user.organization = resp.data.organization;
        updateCurrentUser();
        thisScope.$emit('editUser', {
          status: 'success',
          type: 'primaryOrganization',
          message: gettextCatalog.getString('Primary organization updated')
        });
        if (callback) {
          callback();
        }
      }, function (error) {
        $exceptionHandler(error, 'Set primary organization error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function setPrimaryLocation (location, callback) {
      thisScope.user.location = angular.copy(location);
      saveUser('primaryLocation', callback);
    }

    function setPrimaryJobTitle (title) {
      thisScope.user.job_title = title;
      saveUser('primaryJobTitle');
    }

    function onUploadStart () {
      thisScope.uploadStatus = 'uploading';
    }

    function onUploadSuccess (response) {
      thisScope.user.picture = response.data.picture + '?id=' + Date.now();
      thisScope.uploadStatus = 'success';
      updateCurrentUser();
      thisScope.$emit('editUser', {status: 'success', message: gettextCatalog.getString('Picture uploaded'), type: 'picture'});
    }

    function onUploadError (error) {
      alertService.add('danger', gettextCatalog.getString('There was an error uploading the picture'));
      thisScope.uploadStatus = '';
      $exceptionHandler(error, 'Image upload fail');
      thisScope.$emit('editUser', {status: 'fail'});
    }

    function deletePicture () {
      thisScope.user.picture = '';
      saveUser('picture');
    }

    function setUserPrimaryEmail (email, token) {
      thisScope.user.setPrimaryEmail(email, function (resp) {
        thisScope.user.email = resp.data.email;
        updateCurrentUser();
        thisScope.$emit('editUser', {
          status: 'success',
          type: 'primaryEmail',
          message: gettextCatalog.getString('Primary email updated')
        });
      }, function (error) {
        $exceptionHandler(error, 'Set primary email error');
        thisScope.user.email = primaryEmail;
        thisScope.$emit('editUser', {status: 'fail'});
      }, token);
    }

    function setPrimaryEmail (email) {
      thisScope.$emit('editUser', {status: 'saving'});
      if (thisScope.currentUser.totp) {
        TwoFactorAuthService.requestToken(function (token) {
          setUserPrimaryEmail(email, token);
        }, function () {
          thisScope.user.email = primaryEmail;
          thisScope.$emit('editUser', {status: 'fail'});
        });
        return;
      }
      setUserPrimaryEmail(email);
    }

    function resendValidationEmail (email) {
      thisScope.user.resendValidationEmail(email, function () {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function (error) {
        $exceptionHandler(error, 'Resend validation email error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function setPrimaryPhone (phone) {
      thisScope.$emit('editUser', {status: 'saving'});

      thisScope.user.setPrimaryPhone(phone.number, function (resp) {
        thisScope.user.phone_number = resp.data.phone_number;
        updateCurrentUser();
        thisScope.$emit('editUser', {
          type: 'primaryPhone',
          status: 'success',
          message: gettextCatalog.getString('Primary phone number updated')
        });
      }, function (error) {
        $exceptionHandler(error, 'Set primary phone number error');
        thisScope.$emit('editUser', {status: 'fail'});
      });
    }

    function updateUser (item) {
      if (item === '') {
        return;
      }
      saveUser();
    }

    function addPrimaryOrg () {
      if (!Object.keys(thisScope.temp.organization).length) {
        nextStep();
        return;
      }
      addItem('organization', nextStep);
    }

    function addPrimaryLocation () {
      if (!Object.keys(thisScope.temp.location).length) {
        nextStep();
        return;
      }
      addItem('location', nextStep);
    }

    function makeVisible() {
      thisScope.user.authOnly = false;
      saveUser('authOnly', nextStep);
    }

    function nextStep () {
      if (!thisScope.user.appMetadata) {
        thisScope.user.setAppMetaData({});
      }
      if (!thisScope.user.appMetadata.hid.login) {
        thisScope.user.setAppMetaData({login: true});
        updateCurrentUser();
        saveUser('login');
      }

      thisScope.currentStep = thisScope.currentStep + 1;

      if (thisScope.currentStep === 5) {
        $location.path('/landing');
      }
    }

    thisScope.changePermission = function (key) {
      thisScope.user[key] = thisScope.temp[key];
      saveUser(key);
    };

    //Wait until user is loaded into scope by parent controller
    thisScope.$on('userLoaded', function () {
      setUpFields();
    });

  }

})();
