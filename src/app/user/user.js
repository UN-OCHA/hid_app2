var userDirectives = angular.module('userDirectives', []);

userDirectives.directive('hidUsers', ['$http', '$location', 'config', 'gettextCatalog', 'alertService', 'User', 'ListUser', 'ListUsers', function($http, $location, config, gettextCatalog, alertService, User, ListUser, ListUsers) {
  return {
    restrict: 'E',
    templateUrl: 'app/user/users.html',
    scope: {
      users: '=',
      list: '='
    },
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
      scope.getRoles = function () {
        return $http.get(config.hrinfoUrl + '/functional_roles')
          .success(function (resp) {
            scope.roles = resp.data;
          });
      };

      scope.removeFromList = function (user) {
        var alert = alertService.add('warning', gettextCatalog.getString('Are you sure ?'), true, function() {
          ListUsers.delete({listId: scope.list.id, userId: user.id }, function(out) {
            // Close existing alert
            alert.closeConfirm();
            alertService.add('success', gettextCatalog.getString('The user was successfully deleted.'));
            scope.users = ListUsers.get({listId: scope.list.id});
          });
        });
      };
    }
  };
}]);


var userServices = angular.module('userServices', ['ngResource']);

userServices.factory('User', ['$resource', 'config',
  function($resource, config){
    return $resource(config.apiUrl + 'users/:userId', {userId: '@id'});
  }
]);

var userControllers = angular.module('userControllers', []);

userControllers.controller('UserCtrl', ['$scope', '$routeParams', '$http', '$window', 'alertService', 'md5', 'config', 'User', 'List', function($scope, $routeParams, $http, $window, alertService, md5, config, User, List) {
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
  $http.get('https://www.humanitarianresponse.info/hid/locations/countries').then(
    function (response) {
      for (var key in response.data) {
        $scope.countries.push({
          'id': key,
          'name': response.data[key]
        });
      }
    }
  );

  $scope.regions = [];
  $scope.setRegions = function ($item, $model) {
    $scope.regions = [];
    $http.get('https://www.humanitarianresponse.info/hid/locations/' + $item.id).then(
      function (response) {
        for (var key in response.data.regions) {
          $scope.regions.push({
            'id': key,
            'name': response.data.regions[key].name
          });
        }
      }
    );
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
    return $http.get(config.hrinfoUrl + '/functional_roles')
      .success(function (resp) {
        $scope.roles = resp.data;
      });
  };

  $scope.getCountries = function () {
    return $http.get('https://www.humanitarianresponse.info/hid/locations/countries')
      .then(hrinfoResponse);
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
    $scope.user.$save(function (user, response) {
      //  Update the currentUser item in localStorage if the current user is the one being saved
      if (user.id == $scope.currentUser.id) {
        $window.localStorage.setItem('currentUser', JSON.stringify(user));
        $scope.setCurrentUser(user);
      }
    });
  };

  $scope.setOrganization = function (data, index) {
    $scope.user.organizations[index] = data;
  };

}]);

userControllers.controller('UserPrefsCtrl', ['$scope', 'alertService', 'User', function ($scope, alertService, User) {

  $scope.password = {
    old: '',
    new: ''
  };


  $scope.user = User.get({userId: $scope.currentUser.id}, function(user) {
  });

  $scope.savePassword = function() {
    $scope.user.old_password = $scope.password.old;
    $scope.user.new_password = $scope.password.new;
    $scope.user.$save(function (user) {
     alertService.add('success', 'Your password was successfully changed.');
    }, function (resp) {
      alertService.add('danger', 'There was an error saving your password.');
    });
  };
}]);

userControllers.controller('UserNewCtrl', ['$scope', '$location', 'alertService', 'User', function ($scope, $location, alertService, User) {
  $scope.user = new User();
  $scope.currentPath = $location.path();

  $scope.userCreate = function() {
    $scope.user.$save(function(user) {
      alertService.add('success', 'Thank you, your registration is now complete. You will soon receive a confirmation email.');
      //$location.path('/settings' + $scope.user.id);
    }, function (resp) {
      alertService.add('danger', 'There was an error processing your registration.');
    });
  };
}]);


userControllers.controller('UsersCtrl', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.request = $routeParams;
  $scope.users = User.query($routeParams);
  $scope.filters = {};

  $scope.filter = function() {
    $scope.users = User.query($scope.filters);
  };
}]);

userControllers.controller('CheckInCtrl', ['$scope', 'User', function ($scope, User) {
  $scope.status = 'responding';
}]);
