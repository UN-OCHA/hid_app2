(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('KioskCtrl', KioskCtrl);

  KioskCtrl.$inject = ['$scope', '$routeParams', '$location', 'gettextCatalog', 'alertService', 'hrinfoService', 'User', 'UserCheckInService', 'List'];

  function KioskCtrl($scope, $routeParams, $location, gettextCatalog, alertService, hrinfoService, User, UserCheckInService, List) {

    $scope.step = 1;
    $scope.user = new User();
    $scope.title = 'Kiosk Registration';
    $scope.lists = new Array();
    $scope.list = {};
    $scope.kioskCreating = false;
    $scope.newUser = true;
    $scope.organization = {};
    $scope.datePicker = {
      opened: false
    };
    $scope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };

    $scope.getLists = function (val) {
      $scope.lists = List.query({'name': val});
    };

    $scope.getOrganizations = function(search) {
      $scope.organizations = List.query({'name': search, 'type': 'organization'});
    };

    $scope.setStep1Clicked = function () {
      $scope.step1clicked = true;
      return true;
    };

    $scope.setStep2Clicked = function () {
      $scope.step2clicked = true;
      return true;
    };

    $scope.gotoStep = function (step) {
      if (step === 2) {
        $scope.title = "Check into " + $scope.list.list.name;
      }
      if (step === 3) {
        $scope.users = User.query({email: $scope.user.email, authOnly: false}, function () {
          if ($scope.users.length) {
            $scope.user = $scope.users[0];
          }
        });
      }
      $scope.step = step;
    };

    $scope.countries = [];
    hrinfoService.getCountries().then(function (countries) {
      $scope.countries = countries;
    });

    $scope.regions = [];
    $scope.setRegions = function ($item, $model) {
      $scope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.regions = regions;
      });
    };

    $scope.reinitialize = function() {
      $scope.step = 2;
      $scope.kioskCreating = false;
      $scope.departureDate = '';
      $scope.user = new User();
      $scope.step2clicked = false;
    };

    $scope.checkInSuccess = function() {
      if ($scope.newUser) {
        alertService.add('success', gettextCatalog.getString('Thank you for checking in. You will soon receive an email address which will allow you to confirm your account. Please confirm it asap.'));
      }
      else {
        alertService.add('success', gettextCatalog.getString('Thank you for checking in'));
      }
      $scope.reinitialize();
    };

    // Check user in in the lists selected
    $scope.checkin = function (user) {
      if ($scope.organization.list && (!user.organization || !user.organization.list || $scope.organization.list._id != user.organization.list._id)) {
        checkinUser = {
          list: $scope.organization.list._id,
          checkoutDate: $scope.departureDate
        };
        if (user.organization && user.organization.list) {
          // Check out from the old organization
          UserCheckInService.delete({userId: user._id, listType: 'organization', checkInId: user.organization._id}, {}, function (user) {
            UserCheckInService.save({userId: user._id, listType: 'organization'}, checkinUser, function (out) {
              $scope._checkinHelper(user);
            });
          });
        }
        else {
          UserCheckInService.save({userId: user._id, listType: 'organization'}, checkinUser, function (out) {
            $scope._checkinHelper(user);
          });
        }
      }
      else {
        $scope._checkinHelper(user);
      }
    };


    $scope._checkinHelper = function (user) {
      var checkinUser = {}, prom = [];
      checkinUser = {
        list: $scope.list.list._id,
        checkoutDate: $scope.departureDate
      };
      // Then do the checkin
      UserCheckInService.save({userId: user._id, listType: $scope.list.list.type + 's'}, checkinUser, function (out) {
        $scope.checkInSuccess();
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error checking you in.'));
        $scope.reinitialize();
      });
    };

    $scope.kioskCreate = function (kiosk) {
      $scope.kioskCreating = true;
      // If there is no user, create user
      if (!$scope.user._id) {
        $scope.user.locale = gettextCatalog.getCurrentLanguage();
        $scope.user.app_verify_url = $location.protocol() + '://' + $location.host() + '/reset_password';
        $scope.user.registration_type = 'kiosk';

        $scope.user.$save(function(user) {
          $scope.checkin(user);
        }, function (resp) {
          alertService.add('danger', gettextCatalog.getString('There was an error registering your account.'));
          $scope.reinitialize();
        });
      }
      else {
        $scope.newUser = false;
        $scope.user.$update(function (user) {
          $scope.checkin($scope.user);
        }, function (resp) {
          alertService.add('danger', gettextCatalog.getString('There was an error updating your account.'));
          $scope.reinitialize();
        });
      }
    };

    $scope.showDatePicker = function() {
      $scope.datePicker.opened = true;
    };

  }

})();
