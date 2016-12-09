var env = {};
if (window) {
  angular.copy(window.__env, env);
}

var app = angular.module('hidApp', ['ngRoute', 'xeditable', 'ui.bootstrap', 'angular-md5', 'ui.select', 'lr.upload', 'ngPassword', 'ngMessages', 'gettext', 'bcPhoneNumber', 'angularMoment', 'userServices', 'app.dashboard', 'app.list', 'clientServices', 'clientControllers', 'authServices', 'authController', 'appServices', 'appControllers', 'commonDirectives', 'hidControllers', 'hidServices', 'hidDirectives', 'app.user']);

app.constant('config', env);

// TODO: do the offline checks on something other than favicon
Offline.options = {
  checkOnLoad: false,
  interceptRequests: false,
  reconnect: false,
  requests: false //record ajax requests and re-make on connection restore
}

// Configure Offlinejs
app.run(function ($rootScope) {
  $rootScope.isOnline = Offline.state == 'up';
  Offline.on('up', function() {
    $rootScope.isOnline = true;
    $rootScope.$digest();
  });
  Offline.on('down', function() {
    $rootScope.isOnline = false;
    $rootScope.$digest();
  });
});

// Check if user is authenticated for paths which require it
app.run(function ($rootScope, $window, $location, AuthService, alertService) {
  $rootScope.isAuthenticated = false;
  $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute){
    if (nextRoute) {
      alertService.nextRoute();
    }
    if (nextRoute && nextRoute.authenticate && !AuthService.isAuthenticated()){
      // User isn’t authenticated
      $location.path('/');
      event.preventDefault();
    }
    if (nextRoute && nextRoute.authenticate && nextRoute.adminOnly) {
      //$rootScope.initCurrentUser();
      var user = JSON.parse($window.localStorage.getItem('currentUser'));
      if (!user.is_admin) {
        $location.path('/');
        event.preventDefault();
      }
    }
    $rootScope.isAuthenticated = AuthService.isAuthenticated();
  });
});

// Configure languages
app.run(function (gettextCatalog) {
  var lang = window.navigator.language || window.navigator.userLanguage;
  if (lang != 'fr' && lang != 'en') {
    gettextCatalog.setCurrentLanguage('en');
  }
  else {
    gettextCatalog.setCurrentLanguage(lang);
  }
});

//accessibility features - focus h1 on route change, page titles
app.run(function ($rootScope) {
  var hasPrevious = false;
  var siteTitle = ' | Humanitarian ID';

  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    hasPrevious = previous ? true : false;
    $rootScope.title = current.$$route.title + siteTitle;
  });

  $rootScope.$on('$viewContentLoaded', function () {
    if (hasPrevious) {
      var h1 = document.querySelector('h1')
      h1.setAttribute('tabIndex', -1);
      h1.focus();
    }
  });

});

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {

    $routeProvider.
      when('/', {
        templateUrl: 'app/components/auth/login.html',
        controller: 'AuthCtrl',
        title: 'Log in'
      }).
      when('/landing', {
        templateUrl: 'app/components/landing/landing.html',
        authenticate: true,
        title: 'Welcome'
      }).
      when('/dashboard', {
        templateUrl: 'app/components/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        authenticate: true,
        title: 'Dashboard'
      }).
      when('/settings', {
        templateUrl: 'app/components/user/account.html',
        controller: 'UserPrefsCtrl',
        authenticate: true,
        title: 'Settings'
      }).
      when('/settings/:userId', {
        templateUrl: 'app/components/user/account.html',
        controller: 'UserCtrl',
        authenticate: true,
        title: 'Settings'
      }).
      when('/users', {
        templateUrl: 'app/components/user/users-page.html',
        controller: 'UsersPageCtrl',
        authenticate: true,
        title: 'Users'
      }).
      when('/users/new', {
        templateUrl: 'app/components/user/new-user-page.html',
        controller: 'UserNewCtrl',
        authenticate: true,
        title: 'New user'
      }).
      when('/users/:userId', {
        templateUrl: 'app/components/user/user.html',
        controller: 'UserCtrl',
        authenticate: true,
        title: 'User profile'
      }).
      when('/checkin', {
        templateUrl: 'app/components/checkin/checkin.html',
        controller: 'CheckinCtrl',
        authenticate: true,
        title: 'Check-in'
      }).
      when('/checkin/:userId', {
        templateUrl: 'app/components/checkin/checkin.html',
        controller: 'CheckinCtrl',
        authenticate: true,
        title: 'Check-in'
      }).
      when('/kiosk', {
        templateUrl: 'app/components/user/kiosk.html',
        controller: 'KioskCtrl',
        authenticate: true,
        title: 'Kiosk'
      }).
      when('/lists/new', {
        templateUrl: 'app/components/list/new-list.html',
        controller: 'ListEditCtrl',
        authenticate: true,
        title: 'New list'
      }).
      when('/lists/:list', {
        templateUrl: 'app/components/list/list.html',
        controller: 'ListCtrl',
        authenticate: true,
        title: 'List'
      }).
      when('/lists/:list/edit', {
        templateUrl: 'app/components/list/new-list.html',
        controller: 'ListEditCtrl',
        authenticate: true,
        title: 'Edit list'
      }).
      when('/lists', {
        templateUrl: 'app/components/list/lists.html',
        controller: 'ListsCtrl',
        authenticate: true,
        title: 'Lists'
      }).
      when('/clients/new', {
        templateUrl: 'app/components/client/new-client.html',
        controller: 'ClientCtrl',
        authenticate: true,
        adminOnly: true,
        title: 'New client'
      }).
      when('/clients', {
        templateUrl: 'app/components/client/clients.html',
        controller: 'ClientsCtrl',
        authenticate: true,
        adminOnly: true,
        title: 'Clients'
      }).
      when('/clients/:clientId', {
        templateUrl: 'app/components/client/client.html',
        controller: 'ClientCtrl',
        authenticate: true,
        adminOnly: true,
        title: 'Client'
      }).
      when('/clients/:clientId/edit', {
        templateUrl: 'app/components/client/new-client.html',
        controller: 'ClientCtrl',
        authenticate: true,
        adminOnly: true,
        title: 'Edit client'
      }).
      when('/register', {
        templateUrl: 'app/components/auth/register.html',
        controller: 'UserRegisterCtrl',
        title: 'Register'
      })
      .when('/password_reset', {
        templateUrl: 'app/components/auth/password_reset.html',
        controller: 'AuthCtrl',
        title: 'Reset password'
      })
      .when('/reset_password', {
        templateUrl: 'app/components/auth/reset_password.html',
        controller: 'AuthCtrl',
        title: 'Reset password'
      })
      .when('/verify', {
        template: '',
        controller: 'VerifyCtrl'
      })
      .when('/logout', {
        template: '',
        controller: 'AuthCtrl',
        authenticate: true
      })
      .when('/search', {
        templateUrl: 'app/components/search/search-results.html',
        controller: 'SearchCtrl',
        authenticate: true,
        title: 'Search results'
      })
      .otherwise({
        redirectTo: '/'
      });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
  }
]);

app.config(["$httpProvider", function ($httpProvider) {
  $httpProvider.defaults.transformResponse.push(function(responseData){
    var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    var convertDateStringsToDates = function (input) {
      // Ignore things that aren't objects.
      if (typeof input !== "object") return input;

      for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
          var milliseconds = Date.parse(match[0])
          if (!isNaN(milliseconds)) {
            input[key] = new Date(milliseconds);
          }
        } else if (typeof value === "object") {
          // Recurse into object
          convertDateStringsToDates(value);
        }
      }
    }
    convertDateStringsToDates(responseData);
    return responseData;
  });
  $httpProvider.interceptors.push('APIInterceptor');
}]);

// Configure xeditable
app.run(function (editableOptions) {
  editableOptions.theme = 'bs3';
});

var hidControllers = angular.module('hidControllers', []);
var hidServices = angular.module('hidServices', []);
var hidDirectives = angular.module('hidDirectives', []);
