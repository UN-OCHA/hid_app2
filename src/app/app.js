var app = angular.module('hidApp', ['ngRoute', 'xeditable', 'ui.bootstrap', 'angular-md5', 'ui.select', 'ngPassword', 'ngMessages', 'gettext', 'userDirectives', 'userServices', 'userControllers', 'dashboardController', 'listServices', 'listControllers', 'authServices', 'authController', 'appServices', 'appControllers', 'commonDirectives']);

app.constant('config', {
  apiUrl: 'http://api2.dev.humanitarian.id/api/v2/',
  hrinfoUrl: 'https://www.humanitarianresponse.info/en/api/v1.0/',
  listTypes: ['operation', 'bundle', 'disaster', 'organization', 'list']
});

// Check if user is authenticated for paths which require it
app.run(function ($rootScope, $location, AuthService, alertService) {
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

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'app/auth/login.html',
        controller: 'AuthCtrl'
      }).
      when('/dashboard', {
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        authenticate: true
      }).
      when('/settings', {
        templateUrl: 'app/user/account.html',
        controller: 'UserPrefsCtrl',
        authenticate: true
      }).
      when('/settings/:userId', {
        templateUrl: 'app/user/account.html',
        controller: 'UserCtrl',
        authenticate: true
      }).
      when('/users', {
        templateUrl: 'app/user/users-page.html',
        controller: 'UsersCtrl',
        authenticate: true
      }).
      when('/users/new', {
        templateUrl: 'app/user/new-user-page.html',
        controller: 'UserNewCtrl',
        authenticate: true
      }).
      when('/users/:userId', {
        templateUrl: 'app/user/user.html',
        controller: 'UserCtrl',
        authenticate: true
      }).
      when('/checkin', {
        templateUrl: 'app/user/checkin.html',
        controller: 'CheckinCtrl',
        authenticate: true
      }).
      when('/checkin/:userId', {
        templateUrl: 'app/user/checkin.html',
        controller: 'CheckinCtrl',
        authenticate: true
      }).
      when('/lists/new', {
        templateUrl: 'app/list/new-list.html',
        controller: 'ListEditCtrl',
        authenticate: true
      }).
      when('/lists/:list', {
        templateUrl: 'app/list/list.html',
        controller: 'ListCtrl',
        authenticate: true
      }).
      when('/lists/:list/edit', {
        templateUrl: 'app/list/new-list.html',
        controller: 'ListEditCtrl',
        authenticate: true
      }).
      when('/lists', {
        templateUrl: 'app/list/lists.html',
        controller: 'ListsCtrl',
        authenticate: true
      }).
      when('/register', {
        templateUrl: 'app/auth/register.html',
        controller: 'UserNewCtrl'
      })
      .when('/password_reset', {
        templateUrl: 'app/auth/password_reset.html',
        controller: 'AuthCtrl'
      })
      .when('/verify/:userId/:hash', {
        template: '',
        controller: 'VerifyCtrl'
      })
      .when('/logout', {
        template: '',
        controller: 'AuthCtrl',
        authenticate: true
      })
      .otherwise({
        redirectTo: '/'
      });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
  }
]);

// Convert date attributes into date objects
var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {
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

app.config(["$httpProvider", function ($httpProvider) {
  $httpProvider.defaults.transformResponse.push(function(responseData){
    convertDateStringsToDates(responseData);
    return responseData;
  });
  $httpProvider.interceptors.push('APIInterceptor');
}]);

// Configure xeditable
app.run(function (editableOptions) {
  editableOptions.theme = 'bs3';
});
