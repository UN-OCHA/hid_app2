(function() {
  'use strict';

  describe('Select Lists controller', function () {

    var expectedLists, expectListTypes, expectedParams, listFixture, mockConfig, mockList, scope, userFixture;

    beforeEach(function() {
      listFixture = readJSON('app/test-fixtures/list.json');
      userFixture = readJSON('app/test-fixtures/user.json');
      module('app.selectLists');

      mockConfig = {
        listTypes: ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office']
      };
    	mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
        $provide.constant('config', mockConfig);
      });

      mockList.query = function () {};

      spyOn(mockList, 'query').and.callFake(function (arg, callback) {
        callback(listFixture.lists);
      });

      inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        scope.selectedLists = [];
        scope.$emit = function () {};

        spyOn(scope, '$emit').and.callThrough();

        $controller('SelectListsCtrl', {
          $scope: scope
        });
        scope.$digest();
      });
    	
    });

    describe ('Get List types', function () {

      it('should set the labels for the list types', function () {
        expectListTypes = [
          {
            "name": "operation",
            "label": "Operation",
          },
          {
            "name": "bundle",
            "label": "Group",
          },
          {
            "name": "disaster",
            "label": "Disaster",
          },
          {
            "name": "organization",
            "label": "Organization",
          },
          {
            "name": "functional_role",
            "label": "Role",
          },
          {
            "name": "office",
            "label": "Co-ordination hub",
          }
        ]
        expect(scope.listTypes).toEqual(expectListTypes);
      });

    });

    describe('Get Lists', function () {

      it('should not get lists if there is no search term', function () {
        scope.getLists('');
        expect(mockList.query).not.toHaveBeenCalled();
      });

      it('should get the lists that match the search term', function () {
        scope.getLists('findme');
        expectedParams = {
          name: 'findme'
        };
        expect(mockList.query).toHaveBeenCalledWith(expectedParams, jasmine.any(Function));
      });

      it('should search for lists that match the search term and the selected list type', function () {
        scope.selectedTypes.name = 'operation';
        scope.getLists('findme');
        expectedParams = {
          name: 'findme',
          type: 'operation'
        };
        expect(mockList.query).toHaveBeenCalledWith(expectedParams, jasmine.any(Function));
      });

      it('should filter the returned lists to remove already selected lists', function () {
        scope.selectedLists = [listFixture.lists[2], listFixture.lists[5]];
        expectedLists = [listFixture.lists[0], listFixture.lists[1], listFixture.lists[3], listFixture.lists[4]];
        scope.getLists('findme');
        expect(scope.lists).toEqual(expectedLists);
      });

      it('should filter the returned lists to remove lists the user is checked in to as well as the selectedLists', function () {
        scope.filterListsMember = true;
        scope.selectedLists = [listFixture.lists[4]];
        scope.user = userFixture.user1;
        expectedLists = [listFixture.lists[2], listFixture.lists[3], listFixture.lists[5]];
        scope.getLists('findme');
        expect(scope.lists).toEqual(expectedLists);
      });
    });

    describe('Selecting a list', function () {

      it('should add the selected list', function () {
        scope.selectList(listFixture.lists[0]);
        expect(scope.selectedLists).toEqual([listFixture.lists[0]]);
      });

      it('should emit the select list event', function () {
        scope.getLists('findme');
        expectedParams = {
          list: listFixture.lists[0],
          searchTerm: 'findme'
        }
        scope.selectList(listFixture.lists[0]);
        expect(scope.$emit).toHaveBeenCalledWith('selectList', expectedParams);
      });

    });

    describe('Removing a selected list', function () {

      it('should remove the list', function () {
        scope.selectedLists = [listFixture.lists[3], listFixture.lists[4], listFixture.lists[5]];
        scope.removeList(listFixture.lists[4]);
        expect(scope.selectedLists).toEqual([listFixture.lists[3], listFixture.lists[5]]);
      });

    });

  });
})();
