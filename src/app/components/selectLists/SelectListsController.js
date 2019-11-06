(function () {
  'use strict';

  angular
    .module('app.list')
    .controller('SelectListsController', SelectListsController);

  SelectListsController.$inject = ['$scope', 'config', 'List', 'gettextCatalog'];

  function SelectListsController ($scope, config, List, gettextCatalog) {
    var thisScope = $scope;

    // On parent controller:
    // thisScope.selectedLists = [];
    // thisScope.filterListsMember = true; - if need to filter out lists user is a member of
    thisScope.listTypes = [];
    thisScope.getLists = getLists;
    thisScope.selectList = selectList;
    thisScope.removeList = removeList;
    thisScope.selectedTypes = {
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
        thisScope.listTypes.push(
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

    function canCheckIn (list, user) {
      if (list.joinability === 'public' || list.joinability === 'moderated') {
        return true;
      }
      if (list.joinability === 'private' && (list.isManager(user) || list.isOwner(user))) {
        return true;
      }
      return false;
    }

    function filterLists (lists, selectedLists, user) {
      var filteredLists = lists.filter(function (list) {
        if (thisScope.filterListsMember && thisScope.checkInOnly) {
          return !isListMember(list, user) && !isSelected(selectedLists, list) && canCheckIn(list, user);
        }
        if (thisScope.filterListsMember) {
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
      if (thisScope.selectedTypes.name !== 'all') {
        params.type = thisScope.selectedTypes.name;
      }

      List.query(params, function (lists) {
        thisScope.lists = filterLists(lists, thisScope.selectedLists, thisScope.user);
      });
    }

    function selectList (list) {
      thisScope.selectedLists.push(list);
      thisScope.$emit('selectList', {
        list: list,
        searchTerm: searchTerm
      });
    }

    function removeList (list) {
      thisScope.selectedLists.splice(thisScope.selectedLists.indexOf(list), 1);
    }

    function init () {
      getListTypes();
    }

    init();


  }

})();
