(function () {
  'use strict';

  angular
    .module('app.sidebar')
    .factory('SidebarService', SidebarService);

  SidebarService.$inject = ['$rootScope'];

  function SidebarService($rootScope) {

  	function close () {
  		if (sidebar.open) {
        sidebar.open = false;
        sidebar.underlay = false;
        $rootScope.$broadcast('sidebar-closed');
      }
  	}

  	function toggle (name, scroll) {
  		if (sidebar.sidebars[name] && sidebar.open) {
        sidebar.close();
        return;
      }

      $rootScope.$emit('sidebar-toggled', {scroll: scroll});
      sidebar.open = true;
      sidebar.underlay = scroll ? true : false;
      angular.forEach(sidebar.sidebars, function(value, key) {
        sidebar.sidebars[key] = name === key ? true : false;
      });
  	}

  	var sidebar = {
  		open: false,
  		sidebars: {
        admin: false,
        listsFilters: false,
        userFilters: false
      },
      overlay: false,
      underlay: false,
      close: close,
  		toggle: toggle
  	};

  	return sidebar;

  }

 })();
