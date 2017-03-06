(function() {
  'use strict';

  describe('List edit controller', function () {

    var $location, ctrlParams, editList, listFixture, managers, mockGetText, mockList, mockUser, newList, scope;
    listFixture = readJSON('app/test-fixtures/list.json');
    newList = {
      _id: '87876',
      name: 'My new list'
    };
    editList = listFixture.lists[0];
    editList.$update = function () {};      
    managers = [
      {
        _id: 'found'
      }
    ];

    function setUpCtrl (editing) {
      inject(function($rootScope, $controller, _$location_) {
        scope = $rootScope.$new();
        $location = _$location_;

        scope.language = 'en';
        spyOn($location, 'path').and.callThrough();

        ctrlParams = {
          $scope: scope,
          $routeParams: {}
        };
        if (editing) {
          ctrlParams.$routeParams.list = editList._id;
        }
        

        $controller('ListEditCtrl', ctrlParams);
        scope.$digest();
      });
    }

    beforeEach(function() {
      
      mockList = function () {};
      
      mockList.get = function () {
        return editList;
      };
      mockList.save = function () {};
      mockList.$update = function () {};      
      spyOn(mockList, 'get').and.callThrough();
      spyOn(mockList, 'save').and.callFake(function (arg, callback) {
        callback(newList);
      });
      spyOn(editList, '$update').and.callFake(function (callback) {
        callback();
      });

      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      mockUser = {
        query: function () { return managers;}
      };
      spyOn(mockUser, 'query').and.callThrough();
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
      });

      mockGetText = {
        getString: function (str) {
          return str;
        }
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      
    	
    });

    describe('Adding a new list', function () {

      beforeEach(function () {
        setUpCtrl();
      });

      it('should create a new list object with type list', function () {
        expect(scope.list.type).toEqual('list');
      });

      describe('Saving the list', function () {
        beforeEach(function () {
          scope.list.label = 'My new list';
          scope.language = 'fr';
          scope.listSave();
        });

        it('should set the language on the list label', function () {
          expect(scope.list.labels).toEqual([{text: 'My new list', language: 'fr'}]);
        });

        it('should save the list', function () {
          expect(mockList.save).toHaveBeenCalledWith(scope.list, jasmine.any(Function));
        });

        it('should go to the new list', function () {
          scope.$digest();
          expect($location.path).toHaveBeenCalledWith('/lists/' + newList._id);
        });

      });

    });

    describe('Editing a list', function () {

      beforeEach(function () {
        setUpCtrl(true);
      });

      it('should get the list details', function () {
        expect(mockList.get).toHaveBeenCalledWith({'listId': editList._id});
      });

      describe('Saving the list', function () {

        it('should save the edited list', function () {
          scope.listSave();
          expect(editList.$update).toHaveBeenCalled();
        });

        it('should go to the list', function () {
          scope.listSave();
          scope.$digest();
          expect($location.path).toHaveBeenCalledWith('/lists/' + editList._id);
        });

        describe('Updating the list label', function () {

          it('should update the list label', function () {
            scope.list.label = "Edited list";
            scope.language = 'en';
            scope.listSave();
            expect(scope.list.labels).toEqual([{text: 'Edited list', language: 'en'}, {text: 'french list-1', language: 'fr'}]);
          });

          it('should add the list label for the current language if it does not already exist', function () {
            scope.list.labels = [{text: 'list-1', language: 'en'}, {text: 'french list-1', language: 'fr'}];
            scope.list.label = "Edited list";
            scope.language = 'es';
            scope.listSave();
            expect(scope.list.labels).toEqual([{text: 'list-1', language: 'en'}, {text: 'french list-1', language: 'fr'}, {text: 'Edited list', language: 'es'}]);
          });

        });

        describe('Formatting managers', function () {

          it('should only send the manager ids when save the list', function () {
            scope.list.managers = [{_id: '123', name: 'Mary Anne'}, {_id: '567', name: 'Hobbs'}];
            scope.listSave();
            expect(scope.list.managers).toEqual(['123', '567']);
          });

        });
        
      });

    });

    describe('Getting users to assign as managers', function () {
      beforeEach(function () {
        setUpCtrl();
      });

      it('should get users that match the search term', function () {
        scope.getManagers('findme');
        expect(mockUser.query).toHaveBeenCalledWith({name: 'findme'});
        expect(scope.newManagers).toEqual(managers);
      });

      it('should not get users if no search term', function () {
        scope.getManagers('');
        expect(mockUser.query).not.toHaveBeenCalled();
        expect(scope.newManagers).toEqual([]);
      });
    });

  });
})();
