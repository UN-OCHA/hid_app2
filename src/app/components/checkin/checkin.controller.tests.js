(function() {
  'use strict';

  describe('Check-in controller', function () {

    var countries, currentUserId, differentUserId, list1, list2, list3, list4, listDisaster, listQueryResponse, scope, mockhrinfoService,
    mockList, mockUser, mockGetText, mockConfig, mockService, testList, testUser, modalResult, mockUibModal, mockUserDataService, mockUserCheckInService;

    countries = ['france', 'uk'];
    currentUserId = '1234';
    differentUserId = '4321';

    function ctrlSetup (isCurrentUser) {
      inject(function($controller, $rootScope, $q, $injector) {
        scope = $rootScope.$new();

        testUser = $injector.get('User');
        testUser._id = isCurrentUser ? currentUserId : differentUserId;
        testUser.organization = [];
        testUser.emails = [{id: 1, email: 'xx@xx.com', type: 'Work'}];
        testUser.location = {
          country: {
            name: 'UK'
          },
          region: {
            name: 'SoYo'
          }
        };
        testUser.addPhone = function () {
          return;
        };
        testUser.setPrimaryPhone = function () {
          return;
        };
        testUser.addEmail = function () {
          return;
        };
        testUser.setPrimaryEmail = function () {
          return;
        };
        testUser.$update = function () {
          return;
        };
        testUser.get = function () {
          return;
        };

        var ListObj = $injector.get('List');
        list1 = Object.assign({}, ListObj);
        list1._id = 1;
        list1.name = 'My list',
        list1.metadata = {};
        list1.associatedOperations = function () {
          return;
        }

        list2 = Object.assign({}, ListObj);
        list2._id = 2;
        list2.name = 'My Another';
        list2.type = 'operation';
        list2.remote_id = 78;
        list2.metadata = {};
        list2.associatedOperations = function () {
          return;
        }

        list3 = Object.assign({}, ListObj);
        list3._id = 3;
        list3.name = 'Words',
        list3.metadata = {};
        list3.associatedOperations = function () {
          return;
        }

        list4 = Object.assign({}, ListObj);
        list4._id = 4;
        list4.name = 'Guitars',
        list4.metadata = {};
        list4.associatedOperations = function () {
          return;
        }

        listDisaster = Object.assign({}, ListObj);
        listDisaster._id = 5;
        listDisaster.name = 'Disasterous',
        listDisaster.type = 'disaster',
        listDisaster.remote_id = '214354',
        listDisaster.metadata = {
          operation: [
            {
              id: 99
            },
             {
              id: 100
             }
          ]
        };
        listDisaster.associatedOperations = function () {
          return;
        }

        listQueryResponse = [list1, list2, list3, list4];

        scope.currentUser = {
          _id: currentUserId
        };
        scope.editPhoneForm = {};
        scope.editEmailForm = {};
        scope.editLocationForm = {};

        modalResult = {
          then: function(callback) {}
        };
        mockUibModal = {
          open: function() {}
        }; 
   
        spyOn(mockUibModal, 'open').and.returnValue({result: modalResult });


        mockhrinfoService.getCountries = function () {
          var defer = $q.defer();
          defer.resolve(countries);
          return defer.promise;
        };

        mockList.query = function () {
          return;
        };

        spyOn(mockList, 'query').and.callFake(function (params, callback) {
          callback(listQueryResponse);
        });
         spyOn(mockUserDataService, 'getUser').and.callFake(function (params, callback) {
            mockUserDataService.user = testUser;
            callback();
        });

        spyOn(testUser, 'get').and.callFake(function (params, callback) {
            callback(testUser);
        });
        spyOn(testUser, 'addPhone').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'setPrimaryPhone').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'addEmail').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, 'setPrimaryEmail').and.callFake(function (params, callback) {
            callback();
        });
        spyOn(testUser, '$update').and.callFake(function (callback) {
            callback();
        });

        $controller('CheckinCtrl', {
          $scope: scope,
          $routeParams: {userId: isCurrentUser ? currentUserId : differentUserId},
          $uibModal: mockUibModal
        });

        scope.$digest();

      });

    }

    beforeEach(function() {
      module('app.checkin');

      mockhrinfoService = {};
      module('app.common', function($provide) {
        $provide.value('hrinfoService', mockhrinfoService);
        $provide.value('alertService', {});
      });

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });

      mockUser = {};
      mockUserDataService = {};
      mockUserCheckInService = {};
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
        $provide.value('UserDataService', mockUserDataService);
        $provide.value('UserCheckInService', mockUserCheckInService);
      });

      mockUserDataService.getUser = function () {};

      mockService = {};
      module('app.service', function ($provide) {
        $provide.value('Service', mockService);
      });

      mockGetText = {};
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockConfig = {}
      mockConfig.listTypes = ['operation', 'list'];
      module('app.checkin', function($provide) {
        $provide.constant('config', mockConfig);
      });

    });

    describe('Check if checking in the current user', function () {

      describe('check in current user', function () {

        beforeEach(function () {
          ctrlSetup(true);
        });

        it('should set isCurrentUser to true', function () {
          scope.$digest();
          expect(scope.isCurrentUser).toBe(true);
        });
      });

      describe('check in a different user', function () {
        beforeEach(function () {
          ctrlSetup(false);
        });

        it('should set isCurrentUser to false', function () {
          scope.$digest();
          expect(scope.isCurrentUser).toBe(false);
        });
      });

    });

    describe('Searching lists', function() {

      beforeEach(function () {
        ctrlSetup(true);
      });
      
      it('should not search lists if there is no search term', function () {
        scope.getLists('');
        expect(mockList.query).not.toHaveBeenCalled();
      });

      it('should search lists of the selected type', function () {
        scope.selectedTypes.name = 'operation';
        scope.getLists('findme');

        var params = {
          name: 'findme',
          type: 'operation'
        };
        expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
      });

      it('should search lists of all types if not type selected', function () {
        scope.selectedTypes.name = 'all';
        scope.getLists('findme');

        var params = {
          name: 'findme'
        };
        expect(mockList.query).toHaveBeenCalledWith(params, jasmine.any(Function));
      });

      it('should add the returned lists to scope', function () {
        scope.getLists('findme');
        expect(scope.lists).toEqual(listQueryResponse);
      });

    });

    describe('Filtering returned lists', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should remove already selected lists from the returned lists', function () {
        var expectedFilteredList = [list1, list3, list4];
        scope.selectedLists = [list2]
        scope.getLists('findme');
        expect(scope.lists).toEqual(expectedFilteredList);
      });

      // it('should remove lists the user is checked into from the returned lists', function () {
      //   var expectedFilteredList2 = [list1, list2, list4];
      //   scope.user.operations = [
      //     {
      //       _id: '222',
      //       list: list3
      //     }
      //   ]
      //   scope.getLists('findme');
      //   expect(scope.lists).toEqual(expectedFilteredList2);
      // });

    });

    describe('Selecting lists to check in to', function () {

      beforeEach(function () {
        ctrlSetup(true);
      });

      it('should add the list to select lists', function () {
        scope.selectList(list1);
        expect(scope.selectedLists).toEqual([list1]);
      });

      it('should remove the list from select lists', function () {
        scope.selectedLists = [list1, list2, list3];
        scope.removeList(list2);
        expect(scope.selectedLists).toEqual([list1, list3]);
      });

    });

    // TO DO
    // describe('Associated lists', function () {

    //   var expectedParams;

    //   describe('Associated lists for an operation', function () {

    //     beforeEach(function () {
    //       ctrlSetup(true);

    //       expectedParams = {
    //         limit: 20,
    //         'metadata.operation.id': 78
    //       }
    //       scope.selectedLists = [];
    //       scope.getLists('haiti');
    //       scope.selectList(list2);

    //     });

    //     afterEach(function(){
    //       scope.$apply();
    //     });

    //     it('should get the lists associated with the operation', function () {
    //       expect(mockList.query).toHaveBeenCalledWith(expectedParams);
    //     });

    //     it('should filter and show the associated lists', function () {
    //         expect(scope.associatedLists).toEqual([list1, list3, list4])
    //     });

    //   });

      // describe('Associated lists for a disaster', function () {
      //   var expectedParams1;
      //   var expectedParams2;

      //   beforeEach(function () {
      //     ctrlSetup(true);

      //     expectedParams1 = {
      //       limit: 40,
      //       'metadata.operation.id': 99
      //     }
      //     expectedParams2 = {
      //       limit: 40,
      //       'metadata.operation.id': 99
      //     }
      //     scope.selectedLists = [];
      //     scope.getLists('haiti');
      //     scope.selectList(listDisaster);
      //   });

      //   it('should get the lists associated with the operation', function () {
      //     expect(mockList.query).toHaveBeenCalledWith(expectedParams1, jasmine.any(Function));
      //     expect(mockList.query).toHaveBeenCalledWith(expectedParams2, jasmine.any(Function));
      //   });

      //   it('should filter and show the associated lists', function () {
      //       expect(scope.associatedLists).toEqual([list1, list3, list4])
      //   });

      // });

    // });

  });
})();
