(function() {
  'use strict';

  describe('User edit controller', function () {

    var countries, currentUserId, differentUserId, scope, mockhrinfoService,
    mockList, mockUser, mockGetText, mockUserCheckInService, testUser, mockGetString;

    countries = ['france', 'uk'];
    currentUserId = '1234';
    differentUserId = '4321';

    function ctrlSetup (isCurrentUser) {
      inject(function($controller, $rootScope, $q, $injector) {
        scope = $rootScope.$new();

        testUser = $injector.get('User');
        testUser._id = isCurrentUser ? currentUserId : differentUserId;
        testUser.organization = [];
        testUser.organizations = [];
        testUser.emails = [{id: 1, email: 'xx@xx.com', type: 'Work'}];
        testUser.location = {
          country: {
            name: 'UK'
          },
          region: {
            name: 'SoYo'
          }
        };
        testUser.job_titles = [];
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

        scope.currentUser = {
          _id: currentUserId
        };
        scope.editPhoneForm = {};
        scope.editEmailForm = {};
        scope.editLocationForm = {};

        mockhrinfoService.getCountries = function () {
          var defer = $q.defer();
          defer.resolve(countries);
          return defer.promise;
        };

        mockhrinfoService.getRoles = function () {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        }

        mockGetText.getString = function () {
          return;
        }

        mockUserCheckInService.save = function () {
          return;
        }
        mockUserCheckInService.delete = function () {
          return;
        }

        spyOn(scope, '$emit').and.callThrough();

        spyOn(testUser, 'get').and.callFake(function (params, callback) {
          scope.user = testUser;
            callback();
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

        spyOn(mockUserCheckInService, 'save').and.callThrough();
        spyOn(mockUserCheckInService, 'delete').and.callThrough();

        $controller('UserEditCtrl', {
          $scope: scope
        });

        scope.$digest();

      });

    }

    beforeEach(function() {
      module('app.user');

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
      mockUserCheckInService = {};
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
        $provide.value('UserCheckInService', mockUserCheckInService);
      });

      mockGetText = {};
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

    });


    describe('Adding a new item', function () {

      beforeEach(function () {
        ctrlSetup(false);
        scope.user = testUser;
        scope.$emit('userLoaded');

        var key = 'job_title';
        scope.temp[key] = 'new job title';
        scope.addItem(key);

      });

      it('should add the new item to the user', function () {
        expect(scope.user.job_titles).toEqual(['new job title']);
      });

      it('should reset the temporary item', function () {
        expect(scope.temp.job_title).toEqual('');
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        }
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(mockUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addjob_title',
          message: undefined
        }
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Adding an empty item', function () {

      beforeEach(function () {
        ctrlSetup(false);
        scope.user = testUser;
        scope.$emit('userLoaded');

        var key = 'job_title';
        scope.temp[key] = '';
        scope.addItem(key);

      });

      it('should not update the user', function () {
        expect(mockUser.$update).not.toHaveBeenCalled();
      });

    });

    describe('Adding a new organization', function () {

      beforeEach(function () {
        ctrlSetup(false);
        scope.user = testUser;
        scope.$emit('userLoaded');
        scope.$digest()

        var key = 'organization';
        scope.temp[key] = {_id: '3454', list: {_id: '999'}};
        scope.addItem(key);

      });

      it('should call the user checkin service', function () {
        expect(mockUserCheckInService.save).toHaveBeenCalled();
      });

    });

    describe('Removing an item', function () {
      beforeEach(function () {
        ctrlSetup(false);
        scope.user = testUser;
        scope.user.job_titles = ['new job title', 'web developer'];
        scope.$emit('userLoaded');
        scope.$digest()

        var key = 'job_title';
        var value = 'new job title';
        scope.dropItem(key, value);

      });

      it('should remove the item from the user', function () {
        expect(scope.user.job_titles).toEqual(['web developer']);
      });

      it('should update the user', function () {
        expect(mockUser.$update).toHaveBeenCalled();
      });

    });

    describe('Removing an organization', function () {
      beforeEach(function () {
        ctrlSetup(false);
        scope.user = testUser;
        scope.user.organizations = [
          {
            _id: '3456'
          },
          {
            _id: '7664'
          }
        ];
        scope.$emit('userLoaded');
        scope.$digest()

        var key = 'organization';
        var value = {_id: '7664'};
        scope.dropItem(key, value);

      });

      it('should remove the item from the user', function () {
        expect(scope.user.organizations).toEqual([{_id: '3456'}]);
      });

      it('should update the user', function () {
        expect(mockUserCheckInService.delete).toHaveBeenCalled();
      });

    });

  });
})();

// TO DO:
// - on init:
//   - get countries
//   - get roles
//   - get primary location id
// - set primary org
// - set primary location
// - set primary job title
// - set primary email
// - set primary phone
// - resend validation email
// - update user
