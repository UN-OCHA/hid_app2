var userDirectives = angular.module('userDirectives', []);

userDirectives.directive('hidUsers', ['$location', 'gettextCatalog', 'alertService', 'hrinfoService', 'User', 'ListUser', function($location, gettextCatalog, alertService, hrinfoService, User, ListUser) {
  return {
    restrict: 'E',
    templateUrl: 'app/user/users.html',
    scope: false,
    link: function (scope, elem, attrs) {
      scope.filters = $location.search();
      scope.filter = function() {
        if (scope.filters.verified === false) {
          delete scope.filters.verified;
        }
        //scope.users = User.query(scope.filters);
        $location.search(scope.filters);
      };

      scope.roles = [];
      scope.getRoles = function() {
        return hrinfoService.getRoles().then(function (d) {
          scope.roles = d;
        });
      };

      // Delete user account
      scope.deleteUser = function (lu) {
        var alert = alertService.add('danger', gettextCatalog.getString('Are you sure you want to do this ? This user will not be able to access Humanitarian ID anymore.'), true, function() {
          var user = lu.user, inlist = false;
          if (scope.list) {
            inlist = true;
          }
          User.delete({id: user.id}, function (out) {
            alert.closeConfirm();
            alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
            if (inlist) {
              scope.users = ListUser.query({'list': scope.list.id});
            }
            else {
              scope.users.splice(scope.users.indexOf(user), 1);
            }
          });
        });
      };
    }
  };
}]);


var userServices = angular.module('userServices', ['ngResource']);

userServices.factory('User', ['$resource', 'config',
  function($resource, config){
    return $resource(config.apiUrl + 'users/:userId', {userId: '@id'},
    {
      'save': {
        method: 'POST',
        transformRequest: function (data, headersGetter) {
          delete data.checkins;
          delete data.lists;
          delete data.favoriteLists;
          return angular.toJson(data);
        }
      },
      'update': {
        method: 'PUT',
        transformRequest: function (data, headersGetter) {
          delete data.checkins;
          delete data.lists;
          delete data.favoriteLists;
          return angular.toJson(data);
        }
      }
    });
  }
]);

var userControllers = angular.module('userControllers', []);

userControllers.controller('UserCtrl', ['$scope', '$routeParams', '$http', '$window', 'alertService', 'hrinfoService', 'md5', 'config', 'User', 'List', function($scope, $routeParams, $http, $window, alertService, hrinfoService, md5, config, User, List) {
  $scope.setAdminAvailable(true);
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

  $scope.gravatarUrl = '';

  $scope.canEditUser = ($routeParams.userId == $scope.currentUser.id || $scope.currentUser.is_admin);

  $scope.user = User.get({userId: $routeParams.userId}, function(user) {
    var userEmail = md5.createHash(user.email.trim().toLowerCase());
    $scope.gravatarUrl = 'https://secure.gravatar.com/avatar/' + userEmail + '?s=200';
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

  $scope.getOrganization = function(val) {
    return $http.get(config.hrinfoUrl + '/organizations?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
      .then(hrinfoResponse);
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

  $scope.saveUser = function() {
    $scope.user.$update(function (user, response) {
      //  Update the currentUser item in localStorage if the current user is the one being saved
      if (user.id == $scope.currentUser.id) {
        $scope.setCurrentUser(user);
      }
    });
  };

  $scope.setOrganization = function (data, index) {
    $scope.user.organizations[index] = data;
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

userControllers.controller('UserPrefsCtrl', ['$scope', '$location', 'gettextCatalog', 'AuthService', 'alertService', 'User', function ($scope, $location, gettextCatalog, AuthService, alertService, User) {

  $scope.password = {
    old: '',
    new: ''
  };


  $scope.user = User.get({userId: $scope.currentUser.id}, function(user) {
  });

  // Set a new password for the current user
  $scope.savePassword = function() {
    $scope.user.old_password = $scope.password.old;
    $scope.user.new_password = $scope.password.new;
    $scope.user.$update(function (user) {
     alertService.add('success', gettextCatalog.getString('Your password was successfully changed.'));
    }, function (resp) {
      alertService.add('danger', gettextCatalog.getString('There was an error saving your password.'));
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

}]);

userControllers.controller('UserNewCtrl', ['$scope', '$location', 'alertService', 'User', function ($scope, $location, alertService, User) {
  $scope.user = new User();
  $scope.currentPath = $location.path();

  $scope.userCreate = function(registerForm) {
    $scope.user.$save(function(user) {
      alertService.add('success', 'Thank you, your registration is now complete. You will soon receive a confirmation email.');
      registerForm.$setPristine();
      registerForm.$setUntouched();
      $scope.user = new User();
    }, function (resp) {
      alertService.add('danger', 'There was an error processing your registration.');
    });
  };
}]);


userControllers.controller('UsersCtrl', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.request = $routeParams;
  if ($scope.request.q) {
    $scope.request.where = { name: { contains: $scope.request.q } };
    delete $scope.request.q;
  }
  $scope.totalItems = 0;
  $scope.itemsPerPage = 10;
  $scope.currentPage = 1;
  $scope.request.limit = $scope.itemsPerPage;
  $scope.request.skip = 0;
  $scope.listusers = [];

  // Helper function
  var queryCallback = function (users, headers) {
    $scope.listusers = [];
    $scope.totalItems = headers()["x-total-count"];
    angular.forEach($scope.users, function (val, key) {
      this.push({user: val});
    }, $scope.listusers);
    $scope.users = $scope.listusers;
  };

  // Pager function
  $scope.pageChanged = function () {
    $scope.request.skip = ($scope.currentPage - 1) * $scope.itemsPerPage;
    $scope.users = User.query($scope.request, queryCallback);
  };

  $scope.users = User.query($scope.request, queryCallback);

}]);

userControllers.controller('CheckinCtrl', ['$scope', '$routeParams', '$q', 'gettextCatalog', 'hrinfoService', 'alertService', 'User', 'List', 'ListUser', function($scope, $routeParams, $q, gettextCatalog, hrinfoService, alertService, User, List, ListUser) {
  $scope.request = $routeParams;
  $scope.step = 1;
  if (!$routeParams.userId) {
    $scope.user = $scope.currentUser;
  }
  else {
    $scope.user = User.get({userId: $routeParams.userId});
  }
  $scope.lists = List.query({where: {joinability: {"!": "private"}}}, function() {
    $scope.listusers = ListUser.query({user: $scope.user.id}, function() {
      $scope.lists = $scope.lists.filter(function (list) {
        var out = true;
        for (var i = 0, len = $scope.listusers.length; i < len; i++) {
          var lid = $scope.listusers[i].list.id;
          if (lid == list.id) {
            out = false;
          }
        }
        return out;
      });
    });
  });
  

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

  // Check user in in the lists selected
  $scope.checkin = function () {
    var checked = $scope.lists.filter(function (list) {
      return list.checked;
    });
    var checkinUser = {}, prom = [];
    for (var i = 0, len = checked.length; i < len; i++) {
      checkinUser = new ListUser({
        list: checked[i].id,
        user: $scope.user.id,
        checkoutDate: $scope.departureDate
      });
      prom.push(checkinUser.$save());
    }
    if ($scope.currentUser.id == $scope.user.id) {
      prom.push($scope.saveCurrentUser());
    }
    else {
      prom.push($scope.user.$save());
    }
    $q.all(prom).then(function() {
      if ($scope.currentUser.id == $scope.user.id) {
        alertService.add('success', gettextCatalog.getString('You were successfully checked in'));
      }
      else {
        alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully checked in'));
      }
    });
  };

}]);

