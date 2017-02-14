(function() {
  'use strict';

  describe('User controller', function () {

  	var mockAlertService, mockConfig, mockmd5, mockUserDataService, scope, scopeUser, userFixture;

  	userFixture = readJSON('app/test-fixtures/user.json');

  	function setUpCtrl(user, currentUser, edit) {
  		inject(function($rootScope, $controller) {
  			scope = $rootScope.$new();
  			scope.currentUser = currentUser;
  			scope.setCurrentUser = function () {};
  			scopeUser = user;
  			scopeUser.$update = function () {};
  			scopeUser.$delete = function () {};
  			scopeUser.requestConnection = function () {};
  			scopeUser.notify = function () {};
  			scopeUser.claimEmail = function () {};

  			spyOn(mockUserDataService, 'getUser').and.callFake(function (arg, callback) {
	      	mockUserDataService.user = scopeUser;
	      	callback();
	      });
	      spyOn(scopeUser, '$update').and.callFake(function (callback) {
	      	callback();
	      });
	      spyOn(scopeUser, '$delete').and.callFake(function (callback) {
	      	callback();
	      });
	      spyOn(scopeUser, 'requestConnection').and.callFake(function (arg1, callback) {
	      	callback();
	      });
	      spyOn(scopeUser, 'notify').and.callFake(function (arg1, callback) {
	      	callback();
	      });
	      spyOn(scopeUser, 'claimEmail').and.callFake(function (callback) {
	      	callback();
	      });

	      var routeParams = {userId: user._id};
	      if (edit) {
	      	routeParams.edit = 'edit';
	      }
	      
  			$controller('UserCtrl', {
          $scope: scope,
          $routeParams: routeParams
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
      spyOn(mockAlertService, 'add').and.callFake(function (a1, a2, a3, callback) {
        callback();
      });
     
      mockmd5.createHash = function () {
      	return 'fake-hash';
      };
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
			});

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
			});

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

			it('should delete the user', function () {
				expect(scopeUser.$delete).toHaveBeenCalled();
			});

		});

		describe('User contact information permissions', function () {

			describe('Contact information can be viewed by anyone', function () {
				beforeEach(function () {
					userFixture.user2.phone_number = '0114';
					userFixture.user2.phonesVisibility = 'anyone';
					userFixture.user2.email = 'email@email.com';
					userFixture.user2.emailsVisibility = 'anyone';
					userFixture.user2.location = 'somewhere';
					userFixture.user2.locationsVisibility = 'anyone';
					setUpCtrl(userFixture.user2, userFixture.user1);
				});

				it('should show the phone numbers', function () {
					expect(scope.connectionInfo.phonesPermission).toBe('view');
				});

				it('should show the emails', function () {
					expect(scope.connectionInfo.emailsPermission).toBe('view');
				});

				it('should show the locations', function () {
					expect(scope.connectionInfo.locationsPermission).toBe('view');
				});
			});

			describe('Contact information can only be viewed by verified users', function () {

				describe('Viewing as a verified user', function () {
					beforeEach(function () {
						userFixture.user1.verified = true;
						userFixture.user2.phone_number = '12335';
						userFixture.user2.phonesVisibility = 'verified';
						userFixture.user2.email = '12335';
						userFixture.user2.emailsVisibility = 'verified';
						userFixture.user2.location = '12335';
						userFixture.user2.locationsVisibility = 'verified';
						setUpCtrl(userFixture.user2, userFixture.user1);
					});

					it('should show the phone numbers', function () {
						expect(scope.connectionInfo.phonesPermission).toBe('view');
					});

					it('should show the emails', function () {
						expect(scope.connectionInfo.emailsPermission).toBe('view');
					});

					it('should show the locations', function () {
						expect(scope.connectionInfo.locationsPermission).toBe('view');
					});

				});

				describe('Viewing as an un-verified user', function () {
					beforeEach(function () {
						userFixture.user1.verified = false;
						userFixture.user2.phone_number = null;
						userFixture.user2.phonesVisibility = 'verified';
						userFixture.user2.email = null;
						userFixture.user2.emailsVisibility = 'verified';
						userFixture.user2.location = null;
						userFixture.user2.locationsVisibility = 'verified';
						setUpCtrl(userFixture.user2, userFixture.user1);
					});

					it('should show the you must be verified message for phone numbers', function () {
						expect(scope.connectionInfo.phonesPermission).toBe('verified');
					});

					it('should show the you must be verified message for emails', function () {
						expect(scope.connectionInfo.emailsPermission).toBe('verified');
					});

					it('should show the you must be verified message for locations', function () {
						expect(scope.connectionInfo.locationsPermission).toBe('verified');
					});

				});

			});

			describe('Contact information can only be viewed by connections', function () {

				describe('Not in the user\'s connections', function () {

					beforeEach(function () {
						userFixture.user2.phone_number = null;
						userFixture.user2.phonesVisibility = 'connections';
						userFixture.user2.email = null;
						userFixture.user2.emailsVisibility = 'connections';
						userFixture.user2.location = null;
						userFixture.user2.locationsVisibility = 'connections';
						setUpCtrl(userFixture.user2, userFixture.user1);
					});

					it('should show the request phone numbers button', function () {
						expect(scope.connectionInfo.phonesPermission).toBe('connections');
					});

					it('should show the request emails button', function () {
						expect(scope.connectionInfo.emailsPermission).toBe('connections');
					});

					it('should show the request locations button', function () {
						expect(scope.connectionInfo.locationsPermission).toBe('connections');
					});

				});

				describe('Has sent a connection request', function () {

					beforeEach(function () {
						userFixture.user2.phone_number = null;
						userFixture.user2.phonesVisibility = 'connections';
						userFixture.user2.email = null;
						userFixture.user2.emailsVisibility = 'connections';
						userFixture.user2.location = null;
						userFixture.user2.locationsVisibility = 'connections';
						userFixture.user2.connections = [
							{
								_id: '1234',
								pending: true,
								user: userFixture.user1._id
							},
							{
								_id: '12345',
								pending: false,
								user: '7897987'
							}
						];
						setUpCtrl(userFixture.user2, userFixture.user1);
					});

					it('should show the connection pending message for phone number', function () {
						expect(scope.connectionInfo.phonesPermission).toBe('pending');
					});

					it('should show the connection pending message for email', function () {
						expect(scope.connectionInfo.emailsPermission).toBe('pending');
					});

					it('should show the connection pending message for location', function () {
						expect(scope.connectionInfo.locationsPermission).toBe('pending');
					});

				});

				describe('In the user\'s connections', function () {

					beforeEach(function () {
						userFixture.user2.phone_number = '0114';
						userFixture.user2.phonesVisibility = 'connections';
						userFixture.user2.email = 'email@email.com';
						userFixture.user2.emailsVisibility = 'connections';
						userFixture.user2.location = 'somewhere';
						userFixture.user2.locationsVisibility = 'connections';
						setUpCtrl(userFixture.user2, userFixture.user1);
					});

					it('should show the phone numbers', function () {
						expect(scope.connectionInfo.phonesPermission).toBe('view');
					});

					it('should show the emails', function () {
						expect(scope.connectionInfo.emailsPermission).toBe('view');
					});

					it('should show the locations', function () {
						expect(scope.connectionInfo.locationsPermission).toBe('view');
					});

				});

			});

			describe('Requesting to become a users connection so can view their contact details', function () {

				beforeEach(function () {
					userFixture.user2.phone_number = null;
					userFixture.user2.phonesVisibility = 'connections';
					setUpCtrl(userFixture.user2, userFixture.user1);
				});
				
				it('should send a request to be added to the user\'s connections', function () {
					scope.requestConnection();
					expect(scopeUser.requestConnection).toHaveBeenCalledWith(userFixture.user2._id, jasmine.any(Function), jasmine.any(Function));
				});

				it('should show a confirmation that the request has been sent', function () {
					scope.requestConnection();
					expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Connection request sent', false, jasmine.any(Function));
				});

				it('should show that the request has been sent on the profile', function () {
					scope.requestConnection();
					expect(scope.connectionInfo.phonesPermission).toBe('pending');
				});

			});

			describe('Reporting a problem', function () {

				beforeEach(function () {
					setUpCtrl(userFixture.user2, userFixture.user1);
					scope.notify();
				});

				it('should send a notification to the user', function () {
					expect(scopeUser.notify).toHaveBeenCalled();
				});

				it('should show the success message', function () {
					expect(mockAlertService.add).toHaveBeenCalledWith('success', 'User was successfully notified', false, jasmine.any(Function));
				});

			});

			describe('Claiming an orphan account', function () {

				beforeEach(function () {
					setUpCtrl(userFixture.orphanUser, userFixture.user1);
					scope.sendClaimEmail();
				});

				it('should ask you to confirm', function () {
					expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
				});

				it('should claim the email', function () {
					expect(scopeUser.claimEmail).toHaveBeenCalled();
				});

				it('should show the success message', function () {
					expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Claim email sent successfully', false, jasmine.any(Function));
				});

			});

			describe('Edit profile', function () {

				it('should have the edit profile form open if user follows an edit link', function () {
					setUpCtrl(userFixture.user1, userFixture.user1, true);
					scope.sendClaimEmail();
					expect(scope.showProfileForm).toBe(true);
				});

				it('should not have the edit profile form open if user follows an edit link to a profile they cannot edit', function () {
					setUpCtrl(userFixture.user1, userFixture.user2, true);
					scope.sendClaimEmail();
					expect(scope.showProfileForm).toBe(false);
				});

			});

		});

  });

 })();
