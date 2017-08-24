(function() {
  'use strict';

  describe('User edit controller', function () {

  	var checkinResponseUser, countries, mockAlertService, mockConfig, mockGetText, mockhrinfoService, mockList,
    mockUserCheckInService, mockUserDataService, newEmail, newJobTitle, newLocation, newOrganization, newOrgCheckIn,
    newPhoneNumber, newRole, newVoip, newWebsite, regions, scope, scopeUser, userFixture, mockUpload;

    countries = ['france', 'uk'];
    newOrganization = {list: {_id: '999', name: 'My new org'}};
    newOrgCheckIn = {_id:'1232435', list: newOrganization.list._id};
    newPhoneNumber = {_id: '123124', number: '0114 2393939', type: 'Mobile'};
    newEmail = {_id: '987987', email: 'new@example.com', type: 'Work'};
    newVoip = {type: 'skype', username: 'me'};
    newJobTitle = 'web monkey';
    newLocation = {
      country: {
        id: 'hrinfo_loc_414',
        name: 'Ukraine'
      },
      region: {
        id: 'hrinfo_loc_53557',
        name: 'Chernivetska Oblast'
      },
      locality: 'somewhere'
    };
    newWebsite = {url: 'http://bbc.co.uk'};
    newRole = {_id: '12', list: {_id: 'role-id'}};
    regions = [{id: '1', name: 'region 1'}, {id: '2', name: 'region 2'}];

    function setUpCtrl(user, currentUser) {
      inject(function($rootScope, $controller, $injector, $q) {
       scope = $rootScope.$new();
       scopeUser = {};
       scope.currentUser = currentUser;
       scope.setCurrentUser = function () {};
       scopeUser = user;
       scopeUser.$update = function () {};
       scopeUser.$delete = function () {};
       scopeUser.setPrimaryOrganization = function () {};
       scopeUser.addPhone = function () {};
       scopeUser.addEmail = function () {};
       scopeUser.setPrimaryPhone = function () {};
       scopeUser.setPrimaryEmail = function () {};
       scope.user = scopeUser;

       mockhrinfoService.getCountries = function () {
        var defer = $q.defer();
        defer.resolve(countries);
        return defer.promise;
      };

      mockhrinfoService.getRoles = function () {
        var defer = $q.defer();
        defer.resolve();
        return defer.promise;
      };

      mockhrinfoService.getRegions = function () {
        var defer = $q.defer();
        defer.resolve(regions);
        return defer.promise;
      };

      spyOn(mockhrinfoService, 'getRegions').and.callThrough();

      spyOn(scopeUser, '$update').and.callFake(function (callback) {
        callback();
      });
      spyOn(scopeUser, '$delete').and.callFake(function (callback) {
        callback();
      });
      spyOn(scopeUser, 'setPrimaryOrganization').and.callFake(function (arg1, callback) {
        callback({
          data: {
            organization: newOrganization
          }
        });
      });
      spyOn(scopeUser, 'addEmail').and.callFake(function (arg, callback) {
        callback({
          emails: [
            {_id: '987986', email: 'old@example.com', type: 'Work'},
            newEmail
          ]
        });
      });
      spyOn(scopeUser, 'addPhone').and.callFake(function (arg, callback) {
        callback();
      });
      spyOn(scopeUser, 'setPrimaryPhone').and.callFake(function (arg1, callback) {
        callback({
          data: {
            phone_number: newPhoneNumber.number
          }
        });
      });
      spyOn(scopeUser, 'setPrimaryEmail').and.callFake(function (arg1, callback) {
        callback({
          data: {
            email: newEmail.email
          }
        });
      });

      spyOn(scope, '$emit').and.callThrough();

      var deferred = $q.defer();
      mockUpload = jasmine.createSpy('uploadSpy').and.returnValue(deferred.promise)

      $controller('UserEditCtrl', {
        $scope: scope
      });

      scope.$parent.user = {};
      scope.$digest();
    });
    }

    beforeEach(function() {
      userFixture = readJSON('app/test-fixtures/user.json');
      checkinResponseUser = Object.assign({}, userFixture.user1);
      checkinResponseUser.organizations = [userFixture.user1.organizations[0], userFixture.user1.organizations[1], newOrgCheckIn];
      mockAlertService = {};
      mockUserDataService = {};
      mockUserCheckInService = {};
      mockGetText = {};
      mockhrinfoService = {};
      mockConfig = {};
      mockConfig.listTypes = ['operation', 'bundle', 'disaster', 'organization', 'list', 'functional_role', 'office'];

      module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.constant('UserDataService', mockUserDataService);
        $provide.value('UserCheckInService', mockUserCheckInService);
        $provide.value('upload', mockUpload);
      });
      mockUserDataService.getUser = function () {};
      mockUserDataService.formatUserLocations = function () {};
      spyOn(mockUserDataService, 'formatUserLocations').and.callThrough();

      mockUserCheckInService.save = function () {};
      mockUserCheckInService.delete = function () {};
      spyOn(mockUserCheckInService, 'save').and.callFake(function (arg1, arg2, callback) {
        callback(checkinResponseUser);
      });
      spyOn(mockUserCheckInService, 'delete').and.callThrough();

      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
        $provide.value('hrinfoService', mockhrinfoService);
      });
      mockAlertService.add = function () {};
      spyOn(mockAlertService, 'add').and.callFake(function (argument1, argument2, arg3, callback) {
        if (callback) {
          callback([argument1, argument2, arg3]);
        }
     });

      mockGetText = {};
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });
      mockGetText.getString = function (str) {
        return str;
      };

      mockList = {};
      module('app.list', function($provide) {
        $provide.value('List', mockList);
      });
      mockList.query = function () {};
    });

    describe('Adding a new phone number', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.phone_number = newPhoneNumber;
        scope.addItem('phone_number');
      });

      it('should add the new phone number to the user', function () {
        expect(scope.user.phone_numbers).toContain(newPhoneNumber);
      });

      it('should reset the temporary phone number', function () {
        expect(scope.temp.phone_number).toEqual({
          type: '',
          number: '1'
        });
      });

      it('should set the phone number as primary', function () {
        expect(scope.user.setPrimaryPhone).toHaveBeenCalledWith(newPhoneNumber.number, jasmine.any(Function), jasmine.any(Function));
        expect(scope.user.phone_number).toEqual(newPhoneNumber.number);
      });

      it('should add the new phone number at the top of the list', function () {
        expect(scope.user.phone_numbers[0]).toEqual(newPhoneNumber);
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should save the phone numer', function () {
        expect(scopeUser.addPhone).toHaveBeenCalledWith(newPhoneNumber, jasmine.any(Function), jasmine.any(Function));
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addphone_number',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });
    });

    describe('Adding a new email', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.email = newEmail;
        scope.addItem('email');
      });

      it('should add the new email to the user', function () {
        expect(scope.user.emails).toContain(newEmail);
      });

      it('should reset the temporary email', function () {
        expect(scope.temp.email).toEqual({
          type: '',
          email: ''
        });
      });

      it('should add the new email at the end of the list', function () {
        expect(scope.user.emails.pop()).toEqual(newEmail);
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addemail',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });
    });

    describe('Adding a new social network', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'voip';
        scope.temp[key] = newVoip;
        scope.addItem(key);
      });

      it('should add the new item to the user', function () {
        expect(scope.user.voips).toContain(newVoip);
      });

      it('should reset the temporary item', function () {
        expect(scope.temp.voip).toEqual({
          type: '',
          username: ''
        });
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addvoip',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Adding a new organization', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.organization = newOrganization;
        scope.addItem('organization');
      });

      it('should check the user into the organization', function () {
        expect(mockUserCheckInService.save).toHaveBeenCalledWith({userId: userFixture.user1._id, listType: 'organizations'}, {list: '999'}, jasmine.any(Function));
      });

      it('should add the new organization to the user', function () {
        expect(scope.user.organizations).toContain(newOrganization);
      });

      it('should set the organization as primary', function () {
        expect(scope.user.setPrimaryOrganization).toHaveBeenCalledWith(newOrgCheckIn, jasmine.any(Function), jasmine.any(Function));
        expect(scope.user.organization).toEqual(newOrganization);
      });

      it('should add the new organization at the top of the list', function () {
        expect(scope.$parent.user.organizations[0]).toEqual(newOrgCheckIn);
      });

      it('should reset the temporary organization', function () {
        expect(scope.temp.organization).toEqual({});
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'primaryOrganization',
          message: 'Primary organization updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Adding a new job title', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'job_title';
        scope.temp[key] = newJobTitle;
        scope.addItem(key);
      });

      it('should add the new job title to the user', function () {
        expect(scope.user.job_titles).toContain(newJobTitle);
      });

      it('should reset the temporary job title', function () {
        expect(scope.temp.job_title).toEqual('');
      });

      it('should set the job title as primary', function () {
        expect(scope.user.job_title).toEqual(newJobTitle);
      });

      it('should add the new job title at the top of the list', function () {
        expect(scope.user.job_titles[0]).toEqual(newJobTitle);
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addjob_title',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Selecting a country', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.location.region = {id: 'old-region'};
        scope.temp.location.locality = 'old locality';
        scope.setRegions({id: 'country-id'});
        scope.$digest();
      });

      it('should remove any already selected region or locality', function () {
        expect(scope.temp.location.region).toBeUndefined();
        expect(scope.temp.location.locality).toBeUndefined();
      });

      it('should check for regions for the country', function () {
        expect(mockhrinfoService.getRegions).toHaveBeenCalledWith('country-id');
      });

      it('should show the regions selecter if regions are returned', function () {
        expect(scope.showRegion).toBe(true);
      });

      it('should populate the regions selecter with the returned regions', function () {
        expect(scope.regions).toEqual(regions);
      });

    });

    describe('Adding a new location', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.location = newLocation;
        scope.addItem('location');
      });

      it('should add the new location to the user', function () {
        expect(scope.user.locations).toContain(newLocation);
      });

      it('should set the location as primary', function () {
        expect(scope.user.location).toEqual(newLocation);
      });

      it('should add the new organization at the top of the list', function () {
        expect(scope.user.locations[0]).toEqual(newLocation);
      });

      it('should reset the temporary organization', function () {
        expect(scope.temp.location).toEqual({});
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'primaryLocation',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('Adding a website', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'website';
        scope.temp[key] = newWebsite;
        scope.addItem(key);
      });

      it('should add the new website to the user', function () {
        expect(scope.user.websites).toContain(newWebsite);
      });

      it('should reset the temporary website', function () {
        expect(scope.temp.website).toEqual({ url: ''});
      });

      it('should add the new website at the top of the list', function () {
        expect(scope.user.websites[0]).toEqual(newWebsite);
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'addwebsite',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      describe('formatting the url', function () {
        beforeEach(function () {
          setUpCtrl(userFixture.user1, userFixture.user1);
          scope.$emit('userLoaded');
          scope.user.websites = [];
        });

        it('should add http if the url does not start with http or https', function () {
          scope.temp.website.url = 'www.my-url.com';
          scope.addItem('website');
          expect(scope.user.websites[0]).toEqual({url: 'http://www.my-url.com'});
        });

        it('should not add http if the url starts with http', function () {
          scope.temp.website.url = 'http://www.my-url2.com';
          scope.addItem('website');
          expect(scope.user.websites[0]).toEqual({url: 'http://www.my-url2.com'});
        });

        it('should not add http if the url starts with https', function () {
          scope.temp.website.url = 'https://www.my-url3.com';
          scope.addItem('website');
          expect(scope.user.websites[0]).toEqual({url: 'https://www.my-url3.com'});
        });
      });
    });

    describe('Trying to add an empty item', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        var key = 'job_title';
        scope.temp[key] = '';
        scope.addItem(key);
      });

      it('should not update the user', function () {
        expect(scopeUser.$update).not.toHaveBeenCalled();
      });

    });

    describe('Removing an item', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.user.job_titles = ['new job title', 'web developer'];
        scope.$emit('userLoaded');

        var key = 'job_title';
        var value = 'new job title';
        scope.dropItem(key, value);
      });

      it('should remove the item from the user', function () {
        expect(scope.user.job_titles).toEqual(['web developer']);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

    });

    describe('Removing an organization', function () {
      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');

        var key = 'organization';
        var value = {_id: '7664'};
        scope.dropItem(key, value);
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalled();
      });

      it('should remove the item from the user', function () {
        expect(scope.user.organizations).toEqual([{_id: '3456', list: 'org-id-1', name: 'org1'}]);
      });

      it('should update the user', function () {
        expect(mockUserCheckInService.delete).toHaveBeenCalled();
      });

    });

    describe('Contact permissions', function () {

      beforeEach(function () {
        setUpCtrl(userFixture.user1, userFixture.user1);
        scope.$emit('userLoaded');
        scope.temp.phonesVisibility = 'verified';
        scope.changePermission('phonesVisibility');
      });

      it('should update the permission on the user', function () {
        expect(scope.user.phonesVisibility).toEqual('verified');
      });

      it('should emit the saving event', function () {
        var emitObj = {
          status: 'saving'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

      it('should update the user', function () {
        expect(scopeUser.$update).toHaveBeenCalled();
      });

      it('should emit the success event', function () {
        var emitObj = {
          status: 'success',
          type: 'phonesVisibility',
          message: 'Profile updated'
        };
        expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
      });

    });

    describe('As an admin user', function () {

      describe('Adding a new role', function () {

        beforeEach(function () {
          userFixture.user1.is_admin = true;
          setUpCtrl(userFixture.user1, userFixture.user1);
          scope.$emit('userLoaded');

          var key = 'functional_role';
          scope.temp[key] = newRole;
          scope.addItem(key);
        });

        it('should add the new role to the user', function () {
          expect(scope.user.functional_roles).toContain(newRole);
        });

        it('should reset the temporary role', function () {
          expect(scope.temp.functional_role).toEqual({});
        });

        it('should add the new role at the top of the list', function () {
          expect(scope.user.functional_roles[0]).toEqual(newRole);
        });

        it('should emit the saving event', function () {
          var emitObj = {
            status: 'saving'
          };
          expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
        });

        it('should check the user into the role list', function () {
          expect(mockUserCheckInService.save).toHaveBeenCalledWith({userId: userFixture.user1._id, listType: 'functional_roles'}, {list: 'role-id'}, jasmine.any(Function));
        });

        it('should emit the success event', function () {
          var emitObj = {
            status: 'success',
            type: 'addFunctional_roles',
            message: 'Functional_roles added'
          };
          expect(scope.$emit).toHaveBeenCalledWith('editUser', emitObj);
        });

      });

      describe('Changing a user\'s permissions', function () {
        beforeEach(function () {
          userFixture.user1.is_admin = true;
          setUpCtrl(userFixture.user2, userFixture.user1);
          scope.$emit('userLoaded');
        });

        it('should make a user an admin', function () {
          scope.user.is_admin = true;
          scope.updateUser(scope.user.is_admin);
          expect(scopeUser.$update).toHaveBeenCalled();
        });

        it('should make a user a global manager', function () {
          scope.user.isManager = true;
          scope.updateUser(scope.user.isManager);
          expect(scopeUser.$update).toHaveBeenCalled();
        });
      });

      // describe('Uploading an image', function () {

      //   beforeEach(function () {
      //     userFixture.user1.is_admin = false;
      //     setUpCtrl(userFixture.user2, userFixture.user3);
      //     scope.$emit('userLoaded');
      //   });

      //   it('should not permit file types that are not jpeg or png to be uploaded', function () {
      //     scope.doUpload([{name:'myfile.pdf', type: 'application/pdf'}]);
      //     expect(mockAlertService.add).toHaveBeenCalledWith('danger', 'Error - only jpg and png files are permitted');

      //     scope.doUpload([{name:'myfile.php', type: 'application/php'}]);
      //     expect(mockAlertService.add).toHaveBeenCalledWith('danger', 'Error - only jpg and png files are permitted');
      //   });

      //   it('should permit jpg and png files to be uploaded', function () {
      //     scope.doUpload([{name:'myfile.jpg', type: 'image/jpeg'}]);
      //     expect(mockAlertService.add).not.toHaveBeenCalledWith('danger', 'Error - only jpg and png files are permitted');

      //     scope.doUpload([{name:'myfile.png', type: 'image/png'}]);
      //     expect(mockAlertService.add).not.toHaveBeenCalledWith('danger', 'Error - only jpg and png files are permitted');
      //   });

      // });

    });

  });

})();
