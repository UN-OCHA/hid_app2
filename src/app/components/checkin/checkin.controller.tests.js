(function() {
  'use strict';

  describe('Checkin controller', function () {

    var deferred, deferredLists, expectedMessage, listFixture, scope, mockAlertService, mockConfig, mockGetText, mockList, mockService, mockUser, 
    mockUserCheckInService, mockUserDataService, mockUibModal, userFixture, userId;

    expectedMessage = 'I am the messsage';

    function setUpCtrl(currentUser) {
      inject(function($rootScope, $controller, $q) {
        scope = $rootScope.$new();
        scope.currentUser = userFixture.user1;

        userId = currentUser ? userFixture.user1._id : userFixture.user2._id;
        mockUserDataService.user = currentUser ? userFixture.user1 : userFixture.user2;

        scope.$broadcast = function () {};
        spyOn(scope, '$broadcast');
        
        mockUserCheckInService = {};
        mockUserCheckInService.save = function () {
          deferred = $q.defer();
          return {$promise: deferred.promise};
        };
        spyOn(mockUserCheckInService, 'save').and.callThrough()

        mockList = {};
        mockList.query = function () {};
        deferredLists = $q.defer();
        spyOn(mockList, 'query').and.returnValue({$promise: deferredLists.promise})

        $controller('CheckinCtrl', {
          $scope: scope,
          $routeParams: {userId: userId},
          $uibModal: mockUibModal,
          UserCheckInService: mockUserCheckInService,
          List: mockList
        });

        scope.$digest();
      });
    }

    beforeEach(function() {
     
      mockConfig = {
        listTypes: ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office']
      };
      module('app.checkin', function($provide) {
        $provide.constant('config', mockConfig);
      });

      listFixture = readJSON('app/test-fixtures/list.json');
      userFixture = readJSON('app/test-fixtures/user.json');

      mockGetText = {
        getString: function(str) {
          return str;
        }
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockAlertService = {
        add: function () {}
      };
      spyOn(mockAlertService, 'add').and.callThrough();
      mockUserDataService = {
        getUser: function () {},
        formatUserLocations: function () {}
      };
      spyOn(mockUserDataService, 'getUser').and.callFake(function (arg, callback) {
        callback();
      });
      spyOn(mockUserDataService, 'formatUserLocations');
      module('app.common', function ($provide) {
        $provide.value('alertService', mockAlertService);
      });
      module('app.service', function ($provide) {
        $provide.value('Service', mockService);
      });
      module('app.user', function ($provide) {
        $provide.value('User', mockUser);
        $provide.value('UserDataService', mockUserDataService);
      });

    });

    describe('Get the user', function () {
      
      describe('Checking in the current user', function () {

        beforeEach(function () {
          setUpCtrl(true);
        });

        it('should get the current user details', function () {
          expect(mockUserDataService.getUser).toHaveBeenCalledWith(userFixture.user1._id, jasmine.any(Function), jasmine.any(Function));
        });

        it('should add the user to the view', function () {
          expect(scope.user).toEqual(userFixture.user1);
        });

        it('should set is current user to true', function () {
          expect(scope.isCurrentUser).toBe(true);
        });

        it('should broadcast the user loaded event', function () {
          expect(scope.$broadcast).toHaveBeenCalledWith('userLoaded');
        });
      });

      describe('Checking in a different user', function () {

        beforeEach(function () {
          setUpCtrl(false);
        });

        it('should get the user details', function () {
          expect(mockUserDataService.getUser).toHaveBeenCalledWith(userFixture.user2._id, jasmine.any(Function), jasmine.any(Function));
        });

        it('should add the user to the view', function () {
          expect(scope.user).toEqual(userFixture.user2);
        });

        it('should set is current user to false', function () {
          expect(scope.isCurrentUser).toBe(false);
        });

        it('should broadcast the user loaded event', function () {
          expect(scope.$broadcast).toHaveBeenCalledWith('userLoaded');
        });
      });

    });

    describe ('Checking into a list', function () {

      beforeEach(function () {
        setUpCtrl(true);
        scope.selectedLists = [listFixture.lists[1], listFixture.lists[2]];
        scope.checkin();
      });

      it('should check the user into all the selected lists', function () {
        expect(mockUserCheckInService.save.calls.count()).toBe(2);
      });
    });

    describe('Get associated lists for the selected List', function () {

      describe('List is a bundle, operation, disaster or office', function () {
        beforeEach(function () {
          setUpCtrl(true);
          var list = listFixture.lists[0];
          list.type = 'bundle';
          list.associatedOperations = function () {
            return [1,2];
          }
          scope.$emit('selectList', {
            list: list,
            searchTerm: 'findme'
          });
        });

        it('should get the lists for each associated operation', function () {
          expect(mockList.query).toHaveBeenCalledWith({limit: 20, 'metadata.operation.id' : 1});
          expect(mockList.query).toHaveBeenCalledWith({limit: 20, 'metadata.operation.id' : 2})
        });
      });

      describe('List is an organization', function () {
        beforeEach(function () {
          setUpCtrl(true);
          var list = listFixture.lists[0];
          list.type = 'organization';
          scope.$emit('selectList', {
            list: list,
            searchTerm: 'findme'
          });
        });

        it('should get the lists using the search term', function () {
          expect(mockList.query).toHaveBeenCalledWith({name: 'findme', limit: 20}, jasmine.any(Function));
        });
      });

      describe('List is an role or ccl', function () {
        beforeEach(function () {
          setUpCtrl(true);
          var list = listFixture.lists[0];
          list.type = 'list';
          
          scope.$emit('selectList', {
            list: list,
            searchTerm: 'findme'
          });
        });

        it('should not get associated lists', function () {
          expect(mockList.query).not.toHaveBeenCalled();
        });
      });

    });

    describe('Selecting an associated list', function () {
      beforeEach(function () {
        setUpCtrl(true);
        scope.selectedLists = [];
        scope.associatedLists = [listFixture.lists[0], listFixture.lists[2], listFixture.lists[3]];
        scope.addList(listFixture.lists[2]);
      });

      it('should add the list to selected lists', function () {
        expect(scope.selectedLists).toEqual([listFixture.lists[2]]);
      });

      it('should remove the list from associated lists', function () {
        expect(scope.associatedLists).toEqual([listFixture.lists[0], listFixture.lists[3]]);
      });

    });

    describe('User profile modifications', function () {

      beforeEach(function () {
        setUpCtrl(true);
      });

      describe('User could not be updated', function () {

        it('should show the error message', function () {
          scope.$emit('editUser', {
            status: 'fail',
            message: expectedMessage,
          });
          expect(mockAlertService.add).toHaveBeenCalledWith('danger', expectedMessage);
        });

      });

      describe('User successfully updated', function () {

        beforeEach(function () {
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: ''
          });
        });

        it('should show the success message', function () {
          expect(mockAlertService.add).toHaveBeenCalledWith('success', expectedMessage);
        });

        it('should format the user locations', function () {
          expect(mockUserDataService.formatUserLocations).toHaveBeenCalled();
        });

      });

      describe('Showing the modifications', function () {

        it('should show the modified primary organization', function () {
          scope.user.organization.name = 'org'
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: 'primaryOrganization'
          });
          expect(scope.modifications.organization).toEqual('Changed primary organization to: org');
        });

        it('should show the modified primary phone number', function () {
          scope.user.phone_number = 'phone'
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: 'primaryPhone'
          });
          expect(scope.modifications.phone).toEqual('Changed primary phone number to: phone');
        });

        it('should show the modified primary email', function () {
          scope.user.email = 'email'
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: 'primaryEmail'
          });
          expect(scope.modifications.email).toEqual('Changed primary email to: email');
        });

        it('should show the modified primary location', function () {
          scope.user.location.country.name = 'location'
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: 'primaryLocation'
          });
          expect(scope.modifications.location).toEqual('Changed primary location to: location');
        });

        it('should show the modified primary email', function () {
          scope.user.job_title = 'job_title'
          scope.$emit('editUser', {
            status: 'success',
            message: expectedMessage,
            type: 'primaryJobTitle'
          });
          expect(scope.modifications.job_title).toEqual('Changed primary job title to: job_title');
        });

      });
    });
   
  });
})();
