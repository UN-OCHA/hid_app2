(function() {
  'use strict';

  describe('Service Edit controller', function () {

  	var $location, ctrlParams, listFixture, mockAlertService, mockGetText, mockService, mockServiceCredentials, mockUser, returnedUsers,
  	savedService, scope, service, userFixture;

  	listFixture = readJSON('app/test-fixtures/list.json');
  	userFixture = readJSON('app/test-fixtures/user.json');

  	returnedUsers = [userFixture.user1, userFixture.user2];

  	function setUpCtrl (editing, type) {

  		service = {
	  		_id: '12435',
	  		name: 'My name',
	  		lists: [listFixture.lists[0], listFixture.lists[1]],	  		
	  	};

	  	savedService = Object.assign({}, service);
	  	savedService.owner = userFixture.user1._id;
	  	savedService.managers = [userFixture.user2._id];

      
	  	service.$save = function () {};
	  	service.$update = function () {};
	  	
	  	spyOn(service, '$update').and.callFake(function (callback) {
	  		callback(savedService);
	  	});
	  	

	  	if (type === 'mailchimp') {
	  		service.mailchimp = {
	  			apiKey: '327985y24uigh'
	  		};
	  	}

  		inject(function($rootScope, $controller, $q, _$location_) {
        scope = $rootScope.$new();
        $location = _$location_;

        scope.currentUser = userFixture.user1;

        spyOn($location, 'path').and.callThrough();

        savedService.subscribe = function () {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        };
        spyOn(savedService, 'subscribe').and.callThrough();

        mockService.getMailchimpLists = function () {
        	var deferred = $q.defer();
        	deferred.resolve();
        	return deferred.promise;
        };
        spyOn(mockService, 'getMailchimpLists').and.callThrough();

        mockService.getGoogleGroups = function () {
        	var deferred = $q.defer();
        	deferred.resolve();
        	return deferred.promise;
        };
        spyOn(mockService, 'getGoogleGroups').and.callThrough();

        ctrlParams = {
          $scope: scope,
          $routeParams: {}
        };
        if (editing) {
          ctrlParams.$routeParams.serviceId = service._id;
        }

        $controller('ServiceEditCtrl', ctrlParams);
      });
  	}

  	beforeEach(function () {

  		mockGetText = {
        getString: function (str) {
          return str;
        }
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockAlertService = {
      	add: function () {}
      };
      spyOn(mockAlertService, 'add');
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });

     	mockService = function () {
     		return {
     			$save: jasmine.createSpy('save')
     		};
     	};
	  	mockService.get = function () {};
	  	
	  	spyOn(mockService, 'get').and.callFake(function (arg, callback) {
      	callback(service);	
      });
      mockServiceCredentials = {
      	query: function () {}
      };
      spyOn(mockServiceCredentials, 'query').and.returnValue({_id: '33'});
      module('app.service', function($provide) {
        $provide.value('Service', mockService);
        $provide.value('ServiceCredentials', mockServiceCredentials);
      });

  		mockUser = {
  			query: function () {}
  		};
  		spyOn(mockUser, 'query').and.callFake(function (arg, callback) {
  			callback(returnedUsers);
  		});
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
      });
  		
  	});

  	describe('Adding a new service', function () {

  		beforeEach(function () {
  			setUpCtrl();
  		});

  		it('should set up a new service with a lists array', function () {
  			expect(scope.service.lists).toEqual([]);
  		});

  		it('should get the Google Groups credentials', function () {
  			expect(mockServiceCredentials.query).toHaveBeenCalled();
  		});
  	});

  	describe('Editing a service', function () {

  		beforeEach(function () {
  			setUpCtrl(true);
  		});
  		
  		it('should get the service details', function () {
  			expect(mockService.get).toHaveBeenCalledWith({'serviceId': service._id}, jasmine.any(Function));
  			expect(scope.service._id).toEqual(service._id);
  		});

  		it('should populate the associated lists', function () {
  			expect(scope.selectedLists).toEqual([listFixture.lists[0], listFixture.lists[1]]);
  		});

  		it('should get the Google Groups credentials', function () {
  			expect(mockServiceCredentials.query).toHaveBeenCalled();
  		});

  	});

  	describe('Editing a Mailchimp service', function () {
			beforeEach(function () {
				setUpCtrl(true, 'mailchimp');
			});

			it('should get the mailchimp lists from the api key', function () {
				expect(mockService.getMailchimpLists).toHaveBeenCalledWith('327985y24uigh');
			});
		});

		describe('Get Google Groups', function () {
			beforeEach(function () {
				setUpCtrl();
				scope.service.googlegroup = {
					domain: 'app.hid'
				};
				scope.getGoogleGroups();
			});

			it('should get the Google Groups from the domain', function () {
				expect(mockService.getGoogleGroups).toHaveBeenCalledWith('app.hid');
			});
		});

		describe('Adding managers', function () {

			beforeEach(function () {
				setUpCtrl();
				scope.managers = [userFixture.user2];
				scope.getUsers('findme');
			});

			it('should get users from the search term', function () {
				expect(mockUser.query).toHaveBeenCalledWith({'name': 'findme'}, jasmine.any(Function));
			});

			it('should filter out users who are already managers', function () {
				expect(scope.newUsers).toEqual([userFixture.user1]);
			});

		});

		describe('Removing managers', function () {

			beforeEach(function () {
				setUpCtrl();
				scope.managers = [userFixture.user2, userFixture.user1];
				scope.removeManager(userFixture.user1);
			});

			it('should remove the manager', function () {
				expect(scope.managers).toEqual([userFixture.user2]);
			});

		});

		describe('Saving a service', function () {

			describe('Saving a new service', function () {

				beforeEach(function () {
					setUpCtrl();
					scope.selectedLists = [listFixture.lists[0], listFixture.lists[1]];
					scope.saveService();
				});

				it('should add the selected associated lists to the service', function () {
					expect(scope.service.lists).toEqual([listFixture.lists[0], listFixture.lists[1]]);
				});

				it('should save the new service', function () {
					expect(scope.service.$save).toHaveBeenCalled();
				});

			});

			describe('Saving an edited service', function () {

				beforeEach(function () {
					setUpCtrl(true);
          scope.managers = [userFixture.user2];
					scope.selectedLists = [listFixture.lists[0], listFixture.lists[1]];
					scope.saveService();
				});

				it('should add the selected associated lists to the service', function () {
					expect(scope.service.lists).toEqual([listFixture.lists[0], listFixture.lists[1]]);
				});

				it('should save the new service', function () {
					expect(scope.service.$update).toHaveBeenCalled();
				});

        it('should subscribe the managers to the service', function () {
          expect(savedService.subscribe).toHaveBeenCalledWith({_id: userFixture.user2._id, email: userFixture.user2.email});
        });

			});

			describe('On successful save', function () {

				beforeEach(function () {
					setUpCtrl(true);
					scope.saveService();
				});

				it('should show the success message', function () {
					expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Service saved successfully');
				});

				it('should go to the services page', function () {
					expect($location.path).toHaveBeenCalledWith('/services');
				});

			});

		});

  });
})();
