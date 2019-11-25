(function() {
  'use strict';

  describe('Service controller', function () {

  	var $location, ctrlParams, listFixture, mockAlertService, mockGetText, mockService, mockUser, returnedUsersHeaders,
    returnSearchUsers, returnedUsers, savedService, scope, service, userFixture;

  	function setUpCtrl () {

  		service = {
	  		_id: 'sub-1',
	  		name: 'My name',
	  		lists: [listFixture.lists[0], listFixture.lists[1]],
	  	};

  		inject(function($rootScope, $controller, $q, _$location_) {
        scope = $rootScope.$new();
        $location = _$location_;

        scope.currentUser = userFixture.user1;
        scope.setCurrentUser = function () {};
        spyOn(scope, 'setCurrentUser');

        spyOn($location, 'path').and.callThrough();

        service.subscribe = function () {
          var deferred = $q.defer();
          deferred.resolve(userFixture.user2);
          return deferred.promise;
        };
        spyOn(service, 'subscribe').and.callThrough();

        service.unsubscribe = function () {
          var deferred = $q.defer();
          deferred.resolve(userFixture.user1);
          return deferred.promise;
        };
        spyOn(service, 'unsubscribe').and.callThrough();

        service.$delete = function () {};
        spyOn(service, '$delete').and.callFake(function(callback) {
          callback();
        });

        $controller('ServiceController', {
          $scope: scope,
          $routeParams: {
            serviceId: service._id
          }
        });
      });
  	}

  	beforeEach(function () {
      listFixture = readJSON('app/test-fixtures/list.json');
      userFixture = readJSON('app/test-fixtures/user.json');

      returnedUsers = [userFixture.user1];
      returnedUsersHeaders = function () {
        return {
          'x-total-count': 1
        }
      };

    returnSearchUsers = [{_id:'subscribed user', subscriptions: [{_id: 'sdsfd', service: 'sub-1'}]}, Object.assign(userFixture.user2)];

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
      spyOn(mockAlertService, 'add').and.callFake(function(arg1, arg2, arg3, callback) {
        if (callback) {
          callback();
        }
      });
      module('app.common', function($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockService = {};
	  	mockService.get = function () {};
	  	spyOn(mockService, 'get').and.callFake(function (params, callback) {
      	callback(service);
      });

      module('app.service', function($provide) {
        $provide.value('Service', mockService);
      });

  		mockUser = {
  			query: function () {}
  		};
  		spyOn(mockUser, 'query').and.callFake(function (params, callback) {
        if (params['subscriptions.service']) {//subscribers
          callback(returnedUsers, returnedUsersHeaders);
          return;
        }
        callback(returnSearchUsers);

  		});
      module('app.user', function($provide) {
        $provide.value('User', mockUser);
      });

  	});

  	describe('Viewing a service', function () {

  		beforeEach(function () {
  			setUpCtrl();
  		});

  		it('should get the service details', function () {
  			expect(mockService.get).toHaveBeenCalledWith({'serviceId': service._id}, jasmine.any(Function));
  			expect(scope.service._id).toEqual(service._id);
  		});

      it('should check if the current user is subscribed to the service', function () {
        expect(scope.isSubscribed).toBe(true);
      });

      it('should get the first page of subscribers', function () {
        expect(mockUser.query).toHaveBeenCalledWith({'subscriptions.service': 'sub-1', limit: 50, sort: 'name', offset: 0, authOnly: false}, jasmine.any(Function));
        expect(scope.subscribers).toEqual([userFixture.user1]);
        expect(scope.subscribersLoaded).toBe(true);
        expect(scope.pagination.totalItems).toEqual(1);
      });

      it('should get the next page of subscribers', function () {
        scope.pagination.currentPage = 2;
        scope.pageChanged();
        expect(mockUser.query).toHaveBeenCalledWith({'subscriptions.service': 'sub-1', limit: 50, sort: 'name', offset: 50, authOnly: false}, jasmine.any(Function));
      });

  	});

    describe('Subscribing a user to the service', function () {

      beforeEach(function () {
        setUpCtrl();
      });

      it('should search for the user', function () {
        scope.getUsers('findme');
        expect(mockUser.query).toHaveBeenCalledWith({name: 'findme', authOnly: false}, jasmine.any(Function))
      });

      it('should filter out users who are already subscribed', function () {
        scope.getUsers('findme');
        expect(scope.newUsers).toEqual([userFixture.user2]);
      });

      it('should subscribe the selected user', function () {
        scope.subscribe(userFixture.user2);
        expect(service.subscribe).toHaveBeenCalledWith(userFixture.user2);
      });

      it('should add the user to the displayed subscribers', function () {
        scope.subscribe(userFixture.user2);
        scope.$digest();
        expect(scope.subscribers).toEqual([userFixture.user1, userFixture.user2])
      });

      describe('Subscribing the current user', function () {

        it('should update the current user', function () {
          scope.subscribe(userFixture.user1);
          scope.$digest();
          expect(scope.setCurrentUser).toHaveBeenCalled();
        });

        it('should set that the current user is subscribed', function () {
          scope.subscribe(userFixture.user1);
          scope.$digest();
          expect(scope.isSubscribed).toBe(true);
        });

        it('should show the success message', function () {
          scope.subscribe(userFixture.user1);
          scope.$digest();
          expect(mockAlertService.add).toHaveBeenCalledWith('success','You were successfully subscribed to this service');
        });

      });

      describe('Subscribing another user', function () {

        it('should show the success message', function () {
          scope.subscribe(userFixture.user2);
          scope.$digest();
          expect(mockAlertService.add).toHaveBeenCalledWith('success','The user was successfully subscribed to this service');
        });

      });

    });

    describe('Unsubscribing a user from the service', function () {

      beforeEach(function () {
        setUpCtrl();
      });

      it('should unsubscribe the user', function () {
        scope.unsubscribe(userFixture.user1);
        expect(service.unsubscribe).toHaveBeenCalledWith(userFixture.user1);
      });

      it('should remove the user from the displayed subscribers', function () {
        scope.unsubscribe(userFixture.user1);
        scope.$digest();
        expect(scope.subscribers).toEqual([])
      });

      describe('Unsubscribing the current user', function () {

        it('should update the current user', function () {
          scope.unsubscribe(userFixture.user1);
          scope.$digest();
          expect(scope.setCurrentUser).toHaveBeenCalled();
        });

        it('should set that the current user is not subscribed', function () {
          scope.unsubscribe(userFixture.user1);
          scope.$digest();
          expect(scope.isSubscribed).toBe(false);
        });

        it('should show the success message', function () {
          scope.unsubscribe(userFixture.user1);
          scope.$digest();
          expect(mockAlertService.add).toHaveBeenCalledWith('success','You were successfully unsubscribed from this service');
        });

      });

      describe('Unsubscribing another user', function () {

        it('should show the success message', function () {
          scope.unsubscribe(userFixture.user2);
          scope.$digest();
          expect(mockAlertService.add).toHaveBeenCalledWith('success','The user was successfully unsubscribed from this service');
        });

      });

    });

    describe('Delete the service', function () {

      beforeEach(function () {
        setUpCtrl();
        scope.deleteService();
      });

      it('should ask the user to confirm', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('warning', 'Are you sure?', true, jasmine.any(Function));
      });

      it('should delete the service', function () {
        expect(service.$delete).toHaveBeenCalled();
      });

      it('should show the success message', function () {
        expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Service deleted successfully');
      });

      it('should go to the services page', function () {
        expect($location.path).toHaveBeenCalledWith('/services');
      });


    });

  });
})();
