(function () {
  'use strict';

  angular
    .module('app.common')
    .controller('AppCtrl', AppCtrl);

  AppCtrl.$inject = ['$rootScope', '$scope', '$location', '$window', 'alertService', 'gettextCatalog', 'SidebarService', 'User'];

  function AppCtrl($rootScope, $scope, $location, $window, alertService, gettextCatalog, SidebarService, User) {
    $rootScope.canCache = true;
    $scope.currentUser = null;
    $scope.currentUserResource = null;
    $scope.filters = {};
    $scope.language = gettextCatalog.getCurrentLanguage();
    $scope.sidebar = SidebarService;
    $scope.isApp = false;

    function detectApp () {
      // The Cordova app appends 'Cordova/version-number' to the end of the User Agent, e.g. 'Cordova/2.0.1'
      var ua = window.navigator.userAgent;
      return ua.indexOf('Cordova') > 0;
    }
    $scope.isApp = detectApp();
 
    function isTextInput(node) {
      return ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1;
    }
    // Fix for iOS keyboard not closing when tap outside of an input
    function closeIOSKeyboard () { 
      document.addEventListener('touchstart', function(e) {
        if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
          document.activeElement.blur();
        }
      }, false);
    }
    closeIOSKeyboard();

    $scope.keyupEvent = function (event) {
      if (event.key === 'Escape' || event.code === 'Escape' || event.keyCode === 27) {
        $scope.sidebar.close();
      }
    };

    $scope.removeCurrentUser = function() {
      $scope.currentUser = null;
    };

    $scope.setCurrentUser = function (user) {
      $scope.currentUser = new User(user);
      $window.localStorage.setItem('currentUser', JSON.stringify(user));
    };

    $scope.saveCurrentUser = function() {
      var prom = $scope.getCurrentUserResource().$promise;
      prom.then(function () {
        angular.copy($scope.currentUser, $scope.currentUserResource);
        $scope.currentUserResource.$save();
      });
      return prom;
    };

    $scope.getCurrentUserResource = function () {
      if (!$scope.currentUserResource) {
        $scope.currentUserResource = User.get({userId: $scope.currentUser.id});
      }
      return $scope.currentUserResource;
    };

    $scope.initCurrentUser = function () {
      if ($window.localStorage.getItem('currentUser')) {
        $scope.setCurrentUser(JSON.parse($window.localStorage.getItem('currentUser')));
      }
      $scope.initLanguage();
    };

    $rootScope.$on('updateCurrentUser', function () {
      User.get({userId: $scope.currentUser.id}, function (user) {
        $scope.setCurrentUser(user);
      });
    });

    $scope.activeNav = function (path) {
      return $location.path() === path;
    };

    function hideHeaderFooter () {
      return ($location.path() === '/start' || $location.path() === '/tutorial') ? true : false;
    }

    $scope.hideHeaderFooter = hideHeaderFooter();

    $scope.initLanguage = function () {
      if (!$scope.currentUser) {
        return;
      }

      var locale = $scope.currentUser.locale ? $scope.currentUser.locale : 'en';
      var lang = gettextCatalog.getCurrentLanguage();

      if (lang !== locale) {
        gettextCatalog.setCurrentLanguage(locale);
        $scope.language = locale;
      }
    };

    $scope.changeLanguage = function (lang) {
      gettextCatalog.setCurrentLanguage(lang);
      $scope.currentUser.locale = lang;
      $scope.language = lang;
      User.update($scope.currentUser, function (user) {
        $scope.setCurrentUser(user);
      });
    };

    $scope.getCurrentLanguage = function () {
      var lang = gettextCatalog.getCurrentLanguage();
      return lang.toUpperCase();
    };

    var initView = function () {
      alertService.resetPageAlert();
      $scope.sidebar.close();
      $scope.hideHeaderFooter = hideHeaderFooter();
    };

    $scope.initCurrentUser();

    $scope.$on('$routeChangeSuccess', initView);
  }

})();
