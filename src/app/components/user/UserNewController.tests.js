(function() {
  'use strict';

  describe('UserNewController', function () {

    var mockAlertService, mockGetText, mockLocation, mockRegisterForm, mockSave, mockSetAppMetaData, mockSetItem,
    mockUser, mockWindow, scope;

    beforeEach(function() {
      module('app.user');

      mockSetItem = jasmine.createSpy();
      mockWindow = {
        localStorage: {
          setItem: mockSetItem
        }
      };

      mockAlertService = {
        add: function () {}
      };
      spyOn(mockAlertService, 'add').and.callFake(function(arg1, arg2, arg3, callback) {
        if (callback) {
          callback();
        }
      });
      module('app.common', function ($provide) {
        $provide.value('alertService', mockAlertService);
      });

      mockLocation = {
        host: function () {
          return 'myhost';
        },
        path: jasmine.createSpy().and.returnValue('/users/new'),
        protocol: function () {
          return 'http';
        }
      };

      mockSetAppMetaData = jasmine.createSpy();
      mockSave = jasmine.createSpy().and.callFake(function (callback){
        callback({
          _id: '1243'
        });
      });
      mockUser = function () {
        return {
          setAppMetaData: mockSetAppMetaData,
          $save: mockSave
        };
      };
      module('app.user', function ($provide) {
        $provide.value('User', mockUser);
        $provide.value('$location', mockLocation);
        $provide.value('$window', mockWindow);
      });

      mockGetText = {};
      mockGetText.getString = function (str) {
        return str;
      };
      mockGetText.getCurrentLanguage = function () {
        return 'en';
      };
      module('gettext', function($provide) {
        $provide.value('gettextCatalog', mockGetText);
      });

      mockRegisterForm = {
        $setPristine: jasmine.createSpy(),
        $setUntouched: jasmine.createSpy()
      };

    });

    function controllerSetup (isRegistration) {
      inject(function($controller, $rootScope) {
        scope = $rootScope.$new();

        if (isRegistration) {
          mockLocation.path = jasmine.createSpy().and.returnValue('/register');
        }

        $controller('UserNewController', {
          $scope: scope
        });
        scope.$digest();
      });
    }

    describe('New user registration', function () {

      beforeEach(function () {
        controllerSetup(true);
      });

      it('should set the isRegistration variable', function () {
        expect(scope.isRegistration).toBe(true);
      });

      describe('Set up the new user', function () {

        it('should set the login metadata on the new user', function () {
          expect(mockSetAppMetaData).toHaveBeenCalledWith({login: false});
        });

        it('should set the locale on the new user', function () {
          expect(scope.user.locale).toBe('en');
        });

        it('should set the verify url on the new user', function () {
          expect(scope.user.app_verify_url).toBe('http://myhost/verify');
        });

      });

      describe('Save the new user', function () {

        beforeEach(function () {
          scope.userCreate(mockRegisterForm);
        });

        it('should save the user', function () {
          expect(mockSave).toHaveBeenCalled();
        });

        describe('On successful save', function () {

          it('should show the success message', function () {
            expect(mockAlertService.add).toHaveBeenCalledWith('success', 'Thank you for creating an account. You will soon receive a confirmation email to confirm your account.', false, false, 6000);
          });

          it('should reset the form', function () {
            expect(mockRegisterForm.$setPristine).toHaveBeenCalled();
            expect(mockRegisterForm.$setUntouched).toHaveBeenCalled();
          });

          it('should save hidNewUser in localStorage', function () {
            expect(mockSetItem).toHaveBeenCalledWith('hidNewUser', true);
          });

          it('should go to the new user profile', function () {
            expect(mockLocation.path).toHaveBeenCalledWith('/');
          });

        });

      });

    });

    describe('Creating a new user', function () {

      beforeEach(function () {
        controllerSetup();
      });

      it('should set the isRegistration variable', function () {
        expect(scope.isRegistration).toBe(false);
      });

      describe('Set up the new user', function () {

        it('should set the login metadata on the new user', function () {
          expect(mockSetAppMetaData).toHaveBeenCalledWith({login: false});
        });

        it('should set the locale on the new user', function () {
          expect(scope.user.locale).toBe('en');
        });

        it('should set the verify url on the new user', function () {
          expect(scope.user.app_verify_url).toBe('http://myhost/reset_password?orphan=true');
        });

      });

      describe('Save the new user', function () {

        beforeEach(function () {
          scope.userCreate(mockRegisterForm);
        });

        it('should save the user', function () {
          expect(mockSave).toHaveBeenCalled();
        });

        describe('On successful save', function () {

          it('should show the success message', function () {
            expect(mockAlertService.add).toHaveBeenCalledWith('success', 'The user was successfully created. If you inserted an email address, they will receive an email to claim their account. You can now edit the user profile to add more information.', false, false, 6000);
          });

          it('should reset the form', function () {
            expect(mockRegisterForm.$setPristine).toHaveBeenCalled();
            expect(mockRegisterForm.$setUntouched).toHaveBeenCalled();
          });

          it('should go to the new user profile', function () {
            expect(mockLocation.path).toHaveBeenCalledWith('/users/1243');
          });

        });

      });

    });

  });

})();
