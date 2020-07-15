(function () {
  'use strict';

  angular
    .module('app.common')
    .controller('AppController', AppController);

  AppController.$inject = ['$rootScope', '$scope', '$location', '$document', '$window', 'alertService', 'gettextCatalog', 'SidebarService', 'User'];

  function AppController($rootScope, $scope, $location, $document, $window, alertService, gettextCatalog, SidebarService, User) {
    var thisScope = $scope;
    $rootScope.canCache = true;
    thisScope.currentUser = null;
    thisScope.currentUserResource = null;
    thisScope.filters = {};
    thisScope.language = gettextCatalog.getCurrentLanguage();
    thisScope.sidebar = SidebarService;
    thisScope.isApp = false;

    function detectApp () {
      // The Cordova app appends 'Cordova/version-number' to the end of the User Agent, e.g. 'Cordova/2.0.1'
      var ua = $window.navigator.userAgent;
      return ua.indexOf('Cordova') > 0;
    }
    thisScope.isApp = detectApp();

    function isTextInput(node) {
      return ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1;
    }
    // Fix for iOS keyboard not closing when tap outside of an input
    function closeIOSKeyboard () {
      $document[0].addEventListener('touchstart', function(e) {
        if (!isTextInput(e.target) && isTextInput($document[0].activeElement)) {
          $document[0].activeElement.blur();
        }
      }, false);
    }
    closeIOSKeyboard();

    thisScope.keyupEvent = function (event) {
      if (event.key === 'Escape' || event.code === 'Escape' || event.keyCode === 27) {
        thisScope.sidebar.close();
      }
    };

    thisScope.removeCurrentUser = function() {
      thisScope.currentUser = null;
    };

    thisScope.setCurrentUser = function (user) {
      thisScope.currentUser = new User(user);
      $window.localStorage.setItem('currentUser', JSON.stringify(user));
    };

    thisScope.saveCurrentUser = function() {
      var prom = thisScope.getCurrentUserResource().$promise;
      prom.then(function () {
        angular.copy(thisScope.currentUser, thisScope.currentUserResource);
        thisScope.currentUserResource.$save();
      });
      return prom;
    };

    thisScope.getCurrentUserResource = function () {
      if (!thisScope.currentUserResource) {
        thisScope.currentUserResource = User.get({userId: thisScope.currentUser.id});
      }
      return thisScope.currentUserResource;
    };

    $rootScope.$on('updateCurrentUser', function () {
      User.get({userId: thisScope.currentUser.id}, function (user) {
        thisScope.setCurrentUser(user);
      });
    });

    thisScope.activeNav = function (path) {
      return $location.path() === path;
    };

    function hideHeaderFooter () {
      return ($location.path() === '/start' || $location.path() === '/kiosk') ? true : false;
    }

    thisScope.hideHeaderFooter = hideHeaderFooter();

    thisScope.initCDHeader = function () {
      // CD does not need the ui.bootstrap.dropdown classes and in fact they
      // hinder its function. Forcibly remove since docs don't make it clear how
      // one can configure them to avoid injecting this class
      //
      // @see https://github.com/angular-ui/bootstrap/tree/master/src/dropdown
      $document.ready(function () {
        var ochaDropDown = $document[0].getElementById('cd-ocha-dropdown');
        ochaDropDown.classList.remove('dropdown-menu');
        var langSwitcherDropDown = $document[0].getElementById('cd-language');
        langSwitcherDropDown.classList.remove('dropdown-menu');
        var navDropDown = $document[0].querySelector('.cd-site-header__nav-holder');
        navDropDown.classList.remove('dropdown');
        var navDropDownContents = $document[0].getElementById('cd-nav');
        navDropDownContents.classList.remove('dropdown-menu');
      });
    }
    thisScope.initCDHeader();


    thisScope.changeLanguage = function (lang) {
      gettextCatalog.setCurrentLanguage(lang);
      thisScope.currentUser.locale = lang;
      thisScope.language = lang;
      User.update(thisScope.currentUser, function (user) {
        thisScope.setCurrentUser(user);
      });
    };

    thisScope.getCurrentLanguage = function () {
      var lang = gettextCatalog.getCurrentLanguage();
      return lang.toUpperCase();
    };

    thisScope.initLanguage = function () {
      if (!thisScope.currentUser) {
        return;
      }

      var locale = thisScope.currentUser.locale ? thisScope.currentUser.locale : 'en';
      var lang = gettextCatalog.getCurrentLanguage();

      if (lang !== locale) {
        gettextCatalog.setCurrentLanguage(locale);
        thisScope.language = locale;
      }
    };

    thisScope.initCurrentUser = function () {
      if ($window.localStorage.getItem('currentUser')) {
        thisScope.setCurrentUser(JSON.parse($window.localStorage.getItem('currentUser')));
      }
      thisScope.initLanguage();
    };
    thisScope.initCurrentUser();

    var initView = function () {
      alertService.resetPageAlert();
      thisScope.sidebar.close();
      thisScope.hideHeaderFooter = hideHeaderFooter();
    };
    thisScope.$on('$routeChangeSuccess', initView);
  }
})();
