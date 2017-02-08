(function() {
  'use strict';

  describe('User controller', function () {

  	var mockAlertService, mockConfig, mockmd5, mockUserDataService, mockUser, scope, scopeUser, userFixture, user;

  	userFixture = readJSON('app/test-fixtures/user.json');

  	function setUpCtrl(user, currentUser) {
  		inject(function($rootScope, $controller, $injector) {
  			scope = $rootScope.$new();
  			scope.currentUser = currentUser;
  			scope.setCurrentUser = function () {};

  			mockUser = $injector.get('User');
  			scopeUser = new mockUser(user)
  			scopeUser.$update = function () {};
  			scopeUser.$delete = function () {};

  			spyOn(mockUserDataService, 'getUser').and.callFake(function ({}, callback) {
	      	mockUserDataService.user = scopeUser;
	      	callback();
	      });
	      spyOn(scopeUser, '$update').and.callFake(function (callback) {
	      	callback();
	      })
	      spyOn(scopeUser, '$delete').and.callFake(function (callback) {
	      	callback();
	      })
	      
  			$controller('UserCtrl', {
          $scope: scope,
          $routeParams: {userId: user._id}
        });
        scope.$digest();
  		});
  	}

  	beforeEach(function() {
  		mockAlertService = {};
  		mockmd5 = {};
  		mockUserDataService = {};
  		mockConfig = {};
  		mockConfig.apiUrl = 'the-url';

  		module('app.user', function($provide) {
        $provide.constant('config', mockConfig);
        $provide.constant('UserDataService', mockUserDataService);
      });
      mockUserDataService.getUser = function () {};
      mockUserDataService.formatUserLocations = function () {};
      spyOn(mockUserDataService, 'formatUserLocations').and.callThrough();

      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
        $provide.value('md5', mockmd5);
      });
      mockAlertService.add = function () {};
      // spyOn(mockAlertService, 'add').and.callFake(function (argument1, argument2, arg3, callback) {
      //   	callback([argument1, argument2, arg3]);
      // });
      spyOn(mockAlertService, 'add').and.callThrough();
     
      

      mockmd5.createHash = function () {
      	return 'fake-hash';
      }
  	});

  	describe('Profile permissions', function () {

  		describe('User can edit their own profile', function () {

  			beforeEach(function () {
  				setUpCtrl(userFixture.user1, userFixture.user1);
  			});

  			it('should allow the profile to be edited', function () {
		  		expect(scope.canEditUser).toBe(true);
		  	});

  		});

  		describe('User cannot edit someone else\'s profile', function () {

  			beforeEach(function () {
  				setUpCtrl(userFixture.user2, userFixture.user1);
  			});

  			it('should allow the profile to be edited', function () {
		  		expect(scope.canEditUser).toBe(false);
		  	});

  		});

  		describe('Admin can edit someone else\'s profile', function () {

  			beforeEach(function () {
  				setUpCtrl(userFixture.user1, userFixture.adminUser);
  			});

  			it('should allow the profile to be edited', function () {
		  		expect(scope.canEditUser).toBe(true);
		  	});

  		});

  		describe('Global manager can edit someone else\'s profile', function () {

  			beforeEach(function () {
  				setUpCtrl(userFixture.user1, userFixture.globalManagerUser);
  			});

  			it('should allow the profile to be edited', function () {
		  		expect(scope.canEditUser).toBe(true);
		  	});

  		});

  	});

  	describe('Viewing a profile', function () {

  		beforeEach(function () {
				setUpCtrl(userFixture.user1, userFixture.user1);
			});

			it('should get the user from the data service', function () {
				expect(mockUserDataService.getUser).toHaveBeenCalledWith(userFixture.user1._id, jasmine.any(Function), jasmine.any(Function));
			});

			it('should add the user to the view', function () {
				expect(scope.user._id).toEqual(userFixture.user1._id);
				expect(scope.user.name).toEqual(userFixture.user1.name);
			});

			it('should get the api url from config for use on photo upload', function () {
				expect(scope.apiUrl).toEqual('the-url');
			})

  	});

  	describe('User profile image', function () {

  		describe('User has a profile image', function () {

  			beforeEach(function () {
					setUpCtrl(userFixture.user1, userFixture.user1);
				});

				it('should add the profile image to the view', function () {
					expect(scope.pictureUrl).toEqual(userFixture.user1.picture);
				});

  		});

  		describe('User does not have a profile image', function () {
  			beforeEach(function () {
					setUpCtrl(userFixture.user2, userFixture.user2);
				});

				it('should use gravatar to get their profile image and add it to the view', function () {
					var gravatarUrl = 'https://secure.gravatar.com/avatar/fake-hash?s=200';
					expect(scope.pictureUrl).toEqual(gravatarUrl);
				});
  		});

  	});

  	describe('When the profile is edited', function () {

  		beforeEach(function () {
				setUpCtrl(userFixture.user1, userFixture.user1);
			});

			it('should show the saving message while it is being saved', function () {
				scope.$broadcast('editUser', {status: 'saving'});
				expect(scope.saving.show).toBe(true);
        expect(scope.saving.status).toBe('saving');
			});

			it('should hide the saving message if the save fails', function () {
				scope.$broadcast('editUser', {status: 'fail'});
				expect(scope.saving.show).toBe(false);
			});

			describe('profile is saved successfully', function () {

				beforeEach(function () {
					scope.$broadcast('editUser', {status: 'success'});
				});

				it('should show the saved message', function () {
					expect(scope.saving.message).toBe('Profile updated');
				});

				it('should format the users locations', function () {
					expect(mockUserDataService.formatUserLocations).toHaveBeenCalled();
				});

			});

			describe('User has updated their profile image', function () {
				beforeEach(function () {
					scope.user.picture = 'new-image.jpg';
					scope.$broadcast('editUser', {status: 'success', type: 'picture'});
				});

				it('should update the profile image in the view', function () {
					expect(scope.pictureUrl).toBe('new-image.jpg');
				});
			})

  	});

  	describe('Verifying a user', function () {

  		beforeEach(function () {
				setUpCtrl(userFixture.user1, userFixture.adminUser);
				scope.verifyUser();
			});

			it('should toggle the user\'s verified status', function () {
				expect(scope.user.verified).toBe(true);
			});

			it('should update the user', function () {
				expect(scopeUser.$update).toHaveBeenCalled();
			});

			it('should show the confirmation message', function () {
				expect(mockAlertService.add).toHaveBeenCalled();
			});			

  	});

  	describe('Standard user should not be able to verify a user', function () {

			beforeEach(function () {
				setUpCtrl(userFixture.user1, userFixture.user1);
				scope.verifyUser();
			});

			it('should not update the user', function () {
				expect(scopeUser.$update).not.toHaveBeenCalled();
			});

		});

		describe('Deleting a user', function () {

  		beforeEach(function () {
				setUpCtrl(userFixture.user1, userFixture.adminUser);
				scope.deleteUser(scopeUser);
			});

			it('should ask the user to confirm the deletion', function () {
				expect(mockAlertService.add).toHaveBeenCalledWith('danger', 'Are you sure you want to do this? This user will not be able to access Humanitarian ID anymore.', true, jasmine.any(Function));
			});

			// it('should delete the user', function () {
			// 	expect(scopeUser.$delete).toHaveBeenCalled();
			// });

		});

		//TO DO
  	// notify?
  	// user claim email?
  	// v card
  	// open and close edit form
  	//show profile form if /edit

  });

 })();
