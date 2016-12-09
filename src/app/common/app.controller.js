(function () {
  'use strict';

  angular
    .module('app.common')
    .controller('AppCtrl', AppCtrl);

  AppCtrl.$inject = ['$rootScope', '$scope', '$location', '$window', 'gettextCatalog', 'User'];

  function AppCtrl($rootScope, $scope, $location, $window, gettextCatalog, User) {

    $scope.currentUser = null;
    $scope.currentUserResource = null;
    $scope.filters = {};
    $scope.language = gettextCatalog.getCurrentLanguage();

    $scope.sidebar = {
      open: false,
      sidebars: {
        admin: false,
        listsFilters: false,
        userFilters: false
      }
    };

    $scope.closeSidebar = function () {
      $scope.sidebar.open = false;
      $rootScope.$emit('sidebar-closed');
    };

    $scope.toggleSidebar = function (name) {
      if ($scope.sidebar.sidebars[name] && $scope.sidebar.open) {
        $scope.sidebar.open = false;
        $rootScope.$emit('sidebar-closed');
        return;
      }
      $scope.sidebar.open = true;
      angular.forEach($scope.sidebar.sidebars, function(value, key) {
        $scope.sidebar.sidebars[key] = name === key ? true : false;
      });
    };

    $scope.removeCurrentUser = function() {
      $scope.currentUser = null;
    };

    $scope.setCurrentUser = function (user) {
      $scope.currentUser = user;
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
    };

    $scope.activeNav = function (path) {
      return $location.path() === path;
    };

    var initView = function () {
      $scope.closeSidebar();
    };

    $scope.initCurrentUser();

    $scope.$on('$routeChangeSuccess', initView);

  }

})();
