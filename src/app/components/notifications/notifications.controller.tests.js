(function() {
  'use strict';

  describe('Notifications controller', function () {

    var scope, mockNotificationsService;

    var notifications = {
        0: {
          _id: 1,
          read: true
        },
        1: {
          _id: 2,
          read: false
        }
    };

    beforeEach(function() {
      module('app.notifications');

      mockNotificationsService = {};
      module('app.notifications', function($provide) {
        $provide.value('notificationsService', mockNotificationsService);
      });

      mockNotificationsService.all = notifications;
      inject(function($rootScope, $q, $controller) {
        scope = $rootScope.$new();

        mockNotificationsService.getNotifications = function () {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        };

        mockNotificationsService.markAsRead = function () {
          var defer = $q.defer();
          defer.resolve();
          return defer.promise;
        };

        mockNotificationsService.totalUnread = 5;

        spyOn(mockNotificationsService, 'getNotifications').and.callThrough();
        spyOn(mockNotificationsService, 'markAsRead').and.callThrough();

        $controller('NotificationsCtrl', {
          $scope: scope
        });
        scope.$digest();

      });

    });

    describe('Marking notifications as unread', function () {

      it('should mark all unread notifications as read', function () {
        expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith();
      });

    });

    describe('Getting notifications', function () {

      it('should get the notifications and add them to the scope', function () {
        var defaultParams = {
          limit: 10,
          offset: 0,
          sort: '-createdAt'
        };

        expect(mockNotificationsService.getNotifications).toHaveBeenCalledWith(defaultParams);
      });

      it('should get the next page of notifications', function () {
        var secondPageParams = {
          limit: 10,
          offset: 10,
          sort: '-createdAt'
        };
        scope.currentPage = 2;
        scope.getNotifications();
        expect(mockNotificationsService.getNotifications).toHaveBeenCalledWith(secondPageParams);
      });

    });

    // TO DO - move to service tests.
    // describe('Notifications links', function () {

    //   it('should create the create link url for list notifications', function () {
    //     var listNotifcation = {
    //       params: {
    //         list: {
    //           _id: '1234'
    //         }
    //       }
    //     };

    //     expect(scope.getLink(listNotifcation)).toBe('/lists/1234');
    //   });

    //   it('should create the create link url for profile notifications', function () {
    //     var userNotification = {
    //       user: '5678698'
    //     };

    //     expect(scope.getLink(userNotification)).toBe('/users/5678698');
    //   });

    // });

  });
})();

