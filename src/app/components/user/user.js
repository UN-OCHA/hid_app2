var userServices = angular.module('userServices', ['ngCachedResource']);

userServices.factory('User', ['$cachedResource', '$http', '$location', 'config',
  function($cachedResource, $http, $location, config){

    var User = $cachedResource('users', config.apiUrl + 'user/:userId', {userId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    // Return current user checkin
    User.prototype.currentCheckin = function (list) {
      var out = false;
      angular.forEach(this[list.type + 's'], function (val, key) {
        if (angular.equals(list._id, val.list)) {
          out = val;
        }
      });
      return out;
    };

    // Send claim email
    User.prototype.claimEmail = function (success, error) {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      $http.put(config.apiUrl + 'user/' + this._id + '/orphan', {app_reset_url: app_reset_url}).then(success, error);
    };

    // Send password reset email
    User.passwordReset = function(email, success, error) {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      $http.put(config.apiUrl + 'user/password', {email: email, app_reset_url: app_reset_url}).then(success, error);
    };

    // Reset user email
    User.resetPassword = function(hash, password, success, error) {
      $http.put(config.apiUrl + 'user/password', {hash: hash, password: password}).then(success, error);
    };

    // Validate user email
    User.validateEmail = function (hash, success, error) {
      $http.put(config.apiUrl + 'user/emails', { hash: hash }).then(success, error);
    };

    // Resend validation email
    User.prototype.resendValidationEmail = function (email, success, error) {
      var app_validation_url = $location.protocol() + '://' + $location.host() + '/verify';
      $http.put(config.apiUrl + 'user/emails/' + email, {app_validation_url: app_validation_url}).then(success, error);
    };

    // Add email for validation
    User.prototype.addEmail = function (data, success, error) {
      data.app_validation_url = $location.protocol() + '://' + $location.host() + '/verify';
      $http.post(config.apiUrl + 'user/' + this._id + '/emails', data).then(success, error);
    };

    // Set primary email
    User.prototype.setPrimaryEmail = function (email, success, error) {
      $http.put(config.apiUrl + 'user/' + this._id + '/email', { email: email }).then(success, error);
    };

    // Delete email
    User.prototype.dropEmail = function (email, success, error) {
      $http.delete(config.apiUrl + 'user/' + this._id + '/emails/' + email).then(success, error);
    };

    // Add phone number
    User.prototype.addPhone = function (phone, success, error) {
      $http.post(config.apiUrl + 'user/' + this._id + '/phone_numbers', phone).then(success, error);
    };

    // Drop phone number
    User.prototype.dropPhone = function (id, success, error) {
      $http.delete(config.apiUrl + 'user/' + this._id + '/phone_numbers/' + id).then(success, error);
    };

    // Set primary phone number
    User.prototype.setPrimaryPhone = function (phone, success, error) {
      $http.put(config.apiUrl + 'user/' + this._id + '/phone_number', { phone: phone }).then(success, error);
    };


    return User;

  }
]);

userServices.factory('UserCheckIn', ['$cachedResource', 'config',
  function ($cachedResource, config) {
    return $cachedResource('userCheckins', config.apiUrl + 'user/:userId/:listType/:checkInId');
  }
]);

userServices.factory('userService', ['$rootScope', 'User',
  function ($rootScope, User) {
    var filters = {}, userService = {}, users = {}, request = {};

    userService.addFilter = function(key, val, notify) {
      filters[key] = val;
      if (notify) userService.notify();
    };

    userService.setFilters = function(filters2, notify) {
      filters = filters2;
      if (notify) userService.notify();
    };

    userService.setRequest = function (req, notify) {
      request = req;
      if (notify) userService.notify();
    };

    userService.removeFilter = function(key, notify) {
      delete filters[key];
      if (notify) userService.notify();
    };

    userService.filter = function(cb) {
      if (filters.verified === false) {
        delete filters.verified;
      }
      if (filters.is_admin === false) {
        delete filters.is_admin;
      }
      var trequest = angular.copy(request);
      users.length = 0;
      angular.merge(trequest, filters);

      users = User.query(trequest, cb);
    };

    userService.getUsers = function() {
      return users;
    };

    userService.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('users-updated-event', callback);
      scope.$on('$destroy', handler);
    };

    userService.notify = function () {
      $rootScope.$emit('users-updated-event');
    };

    return userService;
  }
]);

var userControllers = angular.module('userControllers', []);

userControllers.controller('UserCtrl', ['$scope', '$routeParams', '$http', '$window', 'gettextCatalog', 'alertService', 'hrinfoService', 'md5', 'config', 'User', 'List', 'UserCheckIn', function($scope, $routeParams, $http, $window, gettextCatalog, alertService, hrinfoService, md5, config, User, List, UserCheckIn) {
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
      alertService.add('danger', gettextCatalog.getString('There was an error: ') + resp.data.message);
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

}]);

userControllers.controller('UserPrefsCtrl', ['$scope', '$location', 'gettextCatalog', 'moment', 'AuthService', 'alertService', 'User', function ($scope, $location, gettextCatalog, moment, AuthService, alertService, User) {

  $scope.password = {
    old: '',
    new: ''
  };

  $scope.timezones = moment.tz.names();


  $scope.user = User.get({userId: $scope.currentUser.id}, function(user) {
  });

  // Set a new password for the current user
  $scope.savePassword = function(form) {
    $scope.user.old_password = $scope.password.old;
    $scope.user.new_password = $scope.password.new;
    $scope.user.$update(function (user) {
      alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
      form.$setPristine();
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error saving your password.'));
      form.$setPristine();
    });
  };

  // Set settings for the current user
  $scope.saveSettings = function (form) {
    $scope.user.$update(function (user) {
      alertService.add('success', gettextCatalog.getString('Your settings were successfully changed.'));
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error saving your settings.'));
    });
  };

  // Delete current user account
  $scope.deleteAccount = function (lu) {
    var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will not be able to access Humanitarian ID anymore.'), true, function() {
      User.delete({id: $scope.user.id}, function (out) {
        alert.closeConfirm();
        alertService.add('success', gettextCatalog.getString('Your account was successfully removed. You are now logged out. Sorry to have you go.'));
        AuthService.logout();
        $scope.removeCurrentUser();
        $location.path('/');
      });
    });
  };

  // Revoke client
  $scope.revokeClient = function (client) {
    var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? You will need to authorize this application again to access it through Humanitarian ID.'), true, function () {
      var index = -1;
      for (var i = 0, len = $scope.user.authorizedClients.length; i < len; i++) {
        if ($scope.user.authorizedClients[i].id == client.id) {
          index = i;
        }
      }
      if (index != -1) {
        $scope.user.authorizedClients.splice(index, 1);
        $scope.user.$update(function (user) {
          alert.closeConfirm();
          alertService.add('success', gettextCatalog.getString('Application successfully revoked.'));
        }, function (resp) {
          alert.closeConfirm();
          alertService.add('danger', gettextCatalog.getString('There was an error revoking this application.'));
        });
      }
      else {
        alert.closeConfirm();
      }
    });
  };

}]);

userControllers.controller('UserNewCtrl', ['$scope', '$location', 'alertService', 'User', 'gettextCatalog', function ($scope, $location, alertService, User, gettextCatalog) {
  $scope.user = new User();
  $scope.user.locale = gettextCatalog.getCurrentLanguage();
  $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/reset_password';
  $scope.currentPath = $location.path();

  $scope.userCreate = function(registerForm) {
    $scope.user.$save(function(user) {
      alertService.add('success', gettextCatalog.getString('The user was successfully created. If you inserted an email address, he/she will receive an email to claim his account. You can now edit the user profile to add more information.'));
      registerForm.$setPristine();
      registerForm.$setUntouched();
      $scope.user = new User();
      $location.path('/users/' + user._id);
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error processing your registration.'));
      registerForm.$setPristine();
    });
  };
}]);

userControllers.controller('UserRegisterCtrl', ['$scope', '$location', 'alertService', 'User', 'gettextCatalog', function ($scope, $location, alertService, User, gettextCatalog) {
  $scope.user = new User();
  $scope.user.locale = gettextCatalog.getCurrentLanguage();
  $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/verify';
  $scope.currentPath = $location.path();

  $scope.userCreate = function(registerForm) {
    $scope.user.$save(function(user) {
      alertService.add('success', gettextCatalog.getString('Thank you for creating an account. You will soon receive a confirmation email to confirm your account.'));
      registerForm.$setPristine();
      registerForm.$setUntouched();
      $scope.user = new User();
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error processing your registration.'));
      registerForm.$setPristine();
    });
  };
}]);

userControllers.controller('UsersCtrl', ['$scope', '$location', function($scope, $location) {

  $scope.clearSearch = function () {
    $location.url($location.path());
  }

}]);

userControllers.controller('KioskCtrl', ['$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'hrinfoService', 'User', 'UserCheckIn', 'List', function ($scope, $routeParams, $location, gettextCatalog, alertService, hrinfoService, User, UserCheckIn, List) {
  $scope.step = 1;
  $scope.user = new User();
  $scope.title = 'Kiosk Registration';
  $scope.lists = new Array();
  $scope.list = {};
  $scope.kioskCreating = false;
  $scope.newUser = true;
  $scope.organization = {};

  $scope.getLists = function (val) {
    $scope.lists = List.query({'name': val});
  };

  $scope.getOrganizations = function(search) {
    $scope.organizations = List.query({'name': search, 'type': 'organization'});
  };

  $scope.setStep1Clicked = function () {
    $scope.step1clicked = true;
    return true;
  };

  $scope.setStep2Clicked = function () {
    $scope.step2clicked = true;
    return true;
  };

  $scope.gotoStep = function (step) {
    if (step === 2) {
      $scope.title = "Check into " + $scope.list.list.name;
    }
    if (step === 3) {
      $scope.users = User.query({email: $scope.user.email}, function () {
        if ($scope.users.length) {
          $scope.user = $scope.users[0];
        }
      });
    }
    $scope.step = step;
  };

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

  $scope.reinitialize = function() {
    $scope.step = 2;
    $scope.kioskCreating = false;
    $scope.departureDate = '';
    $scope.user = new User();
    $scope.step2clicked = false;
  };

  $scope.checkInSuccess = function() {
    if ($scope.newUser) {
      alertService.add('success', gettextCatalog.getString('Thank you for checking in. You will soon receive an email address which will allow you to confirm your account. Please confirm it asap.'));
    }
    else {
      alertService.add('success', gettextCatalog.getString('Thank you for checking in !'));
    }
    $scope.reinitialize();
  };

  // Check user in in the lists selected
  $scope.checkin = function (user) {
    if ($scope.organization.list && (!user.organization || !user.organization.list || $scope.organization.list._id != user.organization.list._id)) {
      checkinUser = {
        list: $scope.organization.list._id,
        checkoutDate: $scope.departureDate
      };
      if (user.organization && user.organization.list) {
        // Check out from the old organization
        UserCheckIn.delete({userId: user._id, listType: 'organization', checkInId: user.organization._id}, {}, function (user) {
          UserCheckIn.save({userId: user._id, listType: 'organization'}, checkinUser, function (out) {
            $scope._checkinHelper(user);
          });
        });
      }
      else {
        UserCheckIn.save({userId: user._id, listType: 'organization'}, checkinUser, function (out) {
          $scope._checkinHelper(user);
        });
      }
    }
    else {
      $scope._checkinHelper(user);
    }
  };


  $scope._checkinHelper = function (user) {
    var checkinUser = {}, prom = [];
    checkinUser = {
      list: $scope.list.list._id,
      checkoutDate: $scope.departureDate
    };
    // Then do the checkin
    UserCheckIn.save({userId: user._id, listType: $scope.list.list.type + 's'}, checkinUser, function (out) {
      $scope.checkInSuccess();
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error checking you in.'));
      $scope.reinitialize();
    });
  };

  $scope.kioskCreate = function (kiosk) {
    $scope.kioskCreating = true;
    // If there is no user, create user
    if (!$scope.user._id) {
      $scope.user.locale = gettextCatalog.getCurrentLanguage();
      $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      $scope.user.registration_type = 'kiosk';

      $scope.user.$save(function(user) {
        $scope.checkin(user);
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error registering your account.'));
        $scope.reinitialize();
      });
    }
    else {
      $scope.newUser = false;
      $scope.user.$update(function (user) {
        $scope.checkin($scope.user);
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error updating your account.'));
        $scope.reinitialize();
      });
    }
  };

}]);

userControllers.controller('CheckinCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'config', 'hrinfoService', 'alertService', 'User', 'UserCheckIn', 'List', function($scope, $routeParams, $q, gettextCatalog, config, hrinfoService, alertService, User, UserCheckIn, List) {
  $scope.request = $routeParams;
  $scope.step = 1;
  $scope.organization = {};

  var queryCallback = function () {
    angular.copy($scope.user.organization, $scope.organization);
    $scope.lists = List.query({}, function() {
      $scope.lists = $scope.lists.filter(function (list) {
        var out = true, listType = '';
        for (var i = 0, len = config.listTypes.length; i < len; i++) {
          listType = config.listTypes[i] + 's';
          if (!$scope.user[listType]) {
            $scope.user[listType] = new Array();
          }
          for (var j = 0, tlen = $scope.user[listType].length; j < tlen; j++) {
            if ($scope.user[listType][j].list == list._id) {
              out = false;
            }
          }
        }
        return out;
      });
    });
  };

  if (!$routeParams.userId) {
    $scope.user = $scope.currentUser;
    queryCallback();
  }
  else {
    $scope.user = User.get({userId: $routeParams.userId}, queryCallback);
  }

  $scope.getOrganizations = function(search) {
    $scope.organizations = List.query({'name': search, 'type': 'organization'});
  };

  $scope.nextStep = function (step) {
    $scope.step = step;
  };

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

  $scope._checkinHelper = function () {
    var checked = $scope.lists.filter(function (list) {
      return list.checked;
    });
    var checkinUser = {}, prom = [];
    for (var i = 0, len = checked.length; i < len; i++) {
      checkinUser = {
        list: checked[i]._id,
        checkoutDate: $scope.departureDate
      };
      UserCheckIn.save({userId: $scope.user._id, listType: checked[i].type + 's'}, checkinUser, function (out) {
        if ($scope.currentUser._id == $scope.user._id) {
          $scope.user = User.get({userId: $scope.currentUser._id}, function () {
            $scope.setCurrentUser($scope.user);
            alertService.add('success', gettextCatalog.getString('You were succesfully checked in'));
          });
        }
        else {
          alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully checked in'));
        }
      });
    }
  };

  // Check user in in the lists selected
  $scope.checkin = function () {
    if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
      checkinUser = {
        list: $scope.organization.list._id,
      };
      if ($scope.user.organization.list) {
        // Check out from the old organization
        UserCheckIn.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function (user) {
          UserCheckIn.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function (out) {
            $scope._checkinHelper();
          });
        });
      }
      else {
        UserCheckIn.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function (out) {
          $scope._checkinHelper();
        });
      }
    }
    else {
      $scope._checkinHelper();
    }
  };

}]);

