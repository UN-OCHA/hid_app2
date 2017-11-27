(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('SelectListsCtrl', SelectListsCtrl);

  SelectListsCtrl.$inject = ['$scope', 'config', 'List', 'gettextCatalog'];

  function SelectListsCtrl ($scope, config, List, gettextCatalog) {
  	// On parent controller:
  	// $scope.selectedLists = [];
  	// $scope.filterListsMember = true; - if need to filter out lists user is a member of
  	$scope.listTypes = [];
  	$scope.getLists = getLists;
  	$scope.selectList = selectList;
  	$scope.removeList = removeList;
  	$scope.selectedTypes = {
      name: 'all'
    };
  	var searchTerm = '';

  	function getListTypes () {
      var listTypes = config.listTypes.filter(function (item) {
        return item !== 'organization';
      });
      angular.forEach(listTypes, function (listType) {

        var label = listType.charAt(0).toUpperCase() + listType.slice(1);
        if (listType === 'bundle') {
          label = gettextCatalog.getString('Group');
        }
        if (listType === 'functional_role') {
          label = gettextCatalog.getString('Role');
        }
        if (listType === 'office') {
          label = gettextCatalog.getString('Co-ordination hub');
        }
        if (listType === 'list') {
          return;
        }
        $scope.listTypes.push(
          {
            name: listType,
            label: label
          }
        );
      });
    }

    function isListMember (list, user) {
      var inList = false;
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (list._id === userList.list) {
            inList = true;
            return inList;
          }
        });
      });
      return inList;
    }

    function isSelected (selectedLists, list) {
      var listSelected = false;
      angular.forEach(selectedLists, function(selectedList) {
        if (list._id === selectedList._id) {
          listSelected = true;
          return listSelected;
        }
      });
      return listSelected;
    }

    function filterLists (lists, selectedLists, user) {
      var filteredLists = lists.filter(function (list) {
      	if ($scope.filterListsMember) {
        	return !isListMember(list, user) && !isSelected(selectedLists, list);
      	}
      	return !isSelected(selectedLists, list);
      });
      return filteredLists;
    }

    function getLists (search) {
      if (search === '') {
        return;
      }
      searchTerm = search;
      var params = {
        name: search
      };
      if ($scope.selectedTypes.name !== 'all') {
        params.type = $scope.selectedTypes.name;
      }

      List.query(params, function (lists) {
        $scope.lists = filterLists(lists, $scope.selectedLists, $scope.user);
      });
    }

    function selectList (list) {
      $scope.selectedLists.push(list);
      $scope.$emit('selectList', {
      	list: list,
      	searchTerm: searchTerm
      });
    }

    function removeList (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    }

    function init () {
      getListTypes();
    }

    init();


  }

})();
