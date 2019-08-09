(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('KioskController', KioskController);

  KioskController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'hrinfoService', 'User', 'UserCheckInService', 'List'];

  function KioskController($exceptionHandler, $scope, $routeParams, $location, gettextCatalog, alertService, hrinfoService, User, UserCheckInService, List) {
    var thisScope = $scope;

    thisScope.step = 1;
    thisScope.user = new User();
    thisScope.title = 'Kiosk Registration';
    thisScope.lists = new Array();
    thisScope.list = {};
    thisScope.kioskCreating = false;
    thisScope.newUser = true;
    thisScope.organization = {};
    thisScope.datePicker = {
      opened: false
    };
    thisScope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };

    thisScope.getLists = function (val) {
      thisScope.lists = List.query({'name': val});
    };

    thisScope.getOrganizations = function(search) {
      thisScope.organizations = List.query({'name': search, 'type': 'organization'});
    };

    thisScope.setStep1Clicked = function () {
      thisScope.step1clicked = true;
      return true;
    };

    thisScope.setStep2Clicked = function () {
      thisScope.step2clicked = true;
      return true;
    };

    thisScope.gotoStep = function (step) {
      if (step === 2) {
        thisScope.title = "Check into " + thisScope.list.list.name;
      }
      if (step === 3) {
        thisScope.users = User.query({email: thisScope.user.email}, function () {
          if (thisScope.users.length) {
            thisScope.user = thisScope.users[0];
          }
        });
      }
      thisScope.step = step;
    };

    thisScope.countries = [];
    hrinfoService.getCountries().then(function (countries) {
      thisScope.countries = countries;
    });

    thisScope.regions = [];
    thisScope.setRegions = function ($item, $model) {
      thisScope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        thisScope.regions = regions;
      });
    };

    thisScope.reinitialize = function() {
      thisScope.step = 2;
      thisScope.kioskCreating = false;
      thisScope.departureDate = '';
      thisScope.user = new User();
      thisScope.step2clicked = false;
    };

    thisScope.checkInSuccess = function() {
      if (thisScope.newUser) {
        alertService.add('success', gettextCatalog.getString('Thank you for checking in. You will soon receive an email address which will allow you to confirm your account. Please confirm it asap.'));
      }
      else {
        alertService.add('success', gettextCatalog.getString('Thank you for checking in'));
      }
      thisScope.reinitialize();
    };

    // Check user in in the lists selected
    thisScope.checkin = function (user) {
      if (thisScope.organization.list && (!user.organization || !user.organization.list || thisScope.organization.list._id != user.organization.list._id)) {
        var checkinUser = {
          list: thisScope.organization.list._id,
          checkoutDate: thisScope.departureDate
        };
        if (user.organization && user.organization.list) {
          // Check out from the old organization
          UserCheckInService.delete({userId: user._id, listType: 'organization', checkInId: user.organization._id}, {}, function (user) {
            UserCheckInService.save({userId: user._id, listType: 'organizations'}, checkinUser, function (out) {
              thisScope.setPrimaryOrganization(user, out.organizations[0], function (err) {
                if (!err) {
                  thisScope._checkinHelper(user);
                }
              });
            });
          });
        }
        else {
          UserCheckInService.save({userId: user._id, listType: 'organizations'}, checkinUser, function (out) {
            // Set the primary organization
            thisScope.setPrimaryOrganization(user, out.organizations[0], function (err) {
              if (!err) {
                thisScope._checkinHelper(user);
              }
            });
          });
        }
      }
      else {
        thisScope._checkinHelper(user);
      }
    };


    thisScope._checkinHelper = function (user) {
      var checkinUser = {}, prom = [];
      checkinUser = {
        list: thisScope.list.list._id,
        checkoutDate: thisScope.departureDate
      };
      // Then do the checkin
      UserCheckInService.save({userId: user._id, listType: thisScope.list.list.type + 's'}, checkinUser, function (out) {
        thisScope.checkInSuccess();
      }, function (error) {
        $exceptionHandler(error, 'Kiosk checkin error');
        thisScope.reinitialize();
      });
    };

    thisScope.kioskCreate = function (kiosk) {
      thisScope.kioskCreating = true;
      // If there is no user, create user
      if (!thisScope.user._id) {
        thisScope.user.locale = gettextCatalog.getCurrentLanguage();
        thisScope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/reset_password';
        thisScope.user.registration_type = 'kiosk';

        thisScope.user.$save(function(user) {
          thisScope.checkin(user);
        }, function (resp) {
          $exceptionHandler(error, 'Kiosk registration error');
          thisScope.reinitialize();
        });
      }
      else {
        thisScope.newUser = false;
        thisScope.user.$update(function (user) {
          thisScope.checkin(thisScope.user);
        }, function (resp) {
          $exceptionHandler(error, 'Kiosk update account error');
          thisScope.reinitialize();
        });
      }
    };

    thisScope.showDatePicker = function() {
      thisScope.datePicker.opened = true;
    };

    thisScope.setPrimaryOrganization = function (user, org, callback) {
      user.setPrimaryOrganization(org, function (resp) {
        callback();
      }, function () {
        callback(error);
      });
    };

  }

})();
