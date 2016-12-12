(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinCtrl', CheckinCtrl);

  CheckinCtrl.$inject = ['$scope', '$routeParams', '$q', '$filter', 'gettextCatalog', 'config', 'hrinfoService', 'alertService', 'User', 'UserCheckInService', 'List'];

  function CheckinCtrl ($scope, $routeParams, $q, $filter, gettextCatalog, config, hrinfoService, alertService, User, UserCheckInService, List) {

    $scope.request = $routeParams;
    $scope.step = 1;
    $scope.organization = {};
    $scope.selectedLists = [];
    $scope.primaryPhone = {};
    $scope.primaryEmail = {};
    $scope.primaryLocation = {};
    $scope.primaryOrganization = {};
    $scope.newPhoneNumber = {};
    $scope.newEmail = {};
    $scope.newLocation = {};
    $scope.newOrganization = {};
    $scope.modifications = {};
    $scope.emailTypes = [
      {value: 'Work', name: 'Work'},
      {value: 'Personal', name: 'Personal'}
    ];
    $scope.phoneNumberTypes = [
      {value: 'Landline', name: 'Landline'},
      {value: 'Mobile', name: 'Mobile'}
    ];
    $scope.isCurrentUser = true;

    function getPrimaryEmailType (primaryEmail, emails) {
      var email = $filter('filter')(emails, {email: primaryEmail})[0];
      return email ? email.type : false;
    }

    var queryCallback = function () {
      angular.copy($scope.user.location, $scope.primaryLocation.location);
      $scope.primaryPhone.type = $scope.user.phone_number_type;
      $scope.primaryPhone.number = $scope.user.phone_number;
      $scope.primaryEmail.type = getPrimaryEmailType($scope.user.email, $scope.user.emails);
      $scope.primaryEmail.email = $scope.user.email;

      $scope.lists = List.query({}, function() {
        $scope.lists = $scope.lists.filter(function (list) {
          var out = true, listType = '';
          for (var i = 0, len = config.listTypes.length; i < len; i++) {
            listType = config.listTypes[i] + 's';
            if (!$scope.user[listType]) {
              $scope.user[listType] = new Array();
            }
            for (var j = 0, tlen = $scope.user[listType].length; j < tlen; j++) {
              if ($scope.user[listType][j].list == list._id) {
                out = false;
              }
            }
          }
          return out;
        });
      });
    };


    function getUser () {
      if (!$routeParams.userId) {
        $scope.user = $scope.currentUser;
        queryCallback();
        return;
      }
      $scope.user = User.get({userId: $routeParams.userId}, queryCallback);
      $scope.isCurrentUser = $scope.currentUser._id === $scope.user._id;
    }
    getUser();

    $scope.updateSelectedLists = function (list) {
      $scope.selectedLists.push(list);
    };

    $scope.removeList = function (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    };

    $scope.isSelected = function (list) {
      return $scope.selectedLists.indexOf(list) !== -1;
    };

    $scope.getOrganizations = function(search) {
      $scope.organizations = List.query({'name': search, 'type': 'organization'});
    };

    $scope.nextStep = function (step) {
      $scope.step = step;
    };

    $scope.countries = [];
    hrinfoService.getCountries().then(function (countries) {
      $scope.countries = countries;
    });


    $scope.regions = [];
    $scope.setRegions = function ($item) {
      $scope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.regions = regions;
      });
    };

    $scope._checkinHelper = function () {
      var selectedLists = $scope.selectedLists;
      var checkinUser = {};
      for (var i = 0, len = selectedLists.length; i < len; i++) {
        checkinUser = {
          list: selectedLists[i]._id,
          checkoutDate: $scope.departureDate
        };
        UserCheckInService.save({userId: $scope.user._id, listType: selectedLists[i].type + 's'}, checkinUser, function () {
          if ($scope.currentUser._id == $scope.user._id) {
            $scope.user = User.get({userId: $scope.currentUser._id}, function () {
              $scope.setCurrentUser($scope.user);
              alertService.add('success', gettextCatalog.getString('You were succesfully checked in'));
            });
          }
          else {
            alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully checked in'));
          }
        });
      }
    };

    // Check user in in the lists selected
    $scope.checkin = function () {
      var checkinUser = {};
      if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
        checkinUser = {
          list: $scope.organization.list._id,
        };
        if ($scope.user.organization.list) {
          // Check out from the old organization
          UserCheckInService.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function () {
            UserCheckInService.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function () {
              $scope._checkinHelper();
            });
          });
        }
        else {
          UserCheckInService.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function () {
            $scope._checkinHelper();
          });
        }
      }
      else {
        $scope._checkinHelper();
      }
    };

    function setPrimaryPhone (newPhoneNumber) {
      $scope.user.setPrimaryPhone(newPhoneNumber.number, function (resp) {
        alertService.add('success', gettextCatalog.getString('Primary phone number set successfully.'));
        $scope.user.phone_number = resp.data.phone_number;
        $scope.user.phone_number_type = resp.data.phone_number_type;
        $scope.modifications.phone = 'Changed primary phone number to: ' + resp.data.phone_number;
        $scope.editPhoneForm.$visible = false;

      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error setting the primary phone number.'));
      });
    }


    $scope.setPrimaryPhone = function () {
      setPrimaryPhone($scope.primaryPhone);
    };

    $scope.addPhone = function () {
      $scope.user.addPhone($scope.newPhoneNumber, function () {
        setPrimaryPhone($scope.newPhoneNumber);
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this phone number.'));
      });
    };

    function setPrimaryEmail (newEmail) {
      $scope.user.setPrimaryEmail(newEmail.email, function (resp) {
        alertService.add('success', gettextCatalog.getString('Primary email address set successfully.'));
        $scope.user.email = resp.data.email;
        $scope.modifications.email = 'Changed primary email address to: ' + resp.data.email;
        $scope.editEmailForm.$visible = false;

      }, function (error) {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this email address - ' + error.data.message));
      });
    }

    $scope.setPrimaryEmail = function () {
      setPrimaryEmail($scope.primaryEmail);
    };

    $scope.addEmail = function () {
      $scope.user.addEmail($scope.newEmail, function (resp) {
        alertService.add('success', gettextCatalog.getString('Email added successfully. You will need to validate it.'));
        $scope.user.emails = angular.copy(resp.data.emails, $scope.user.emails);
      }, function () {
        alertService.add('danger', gettextCatalog.getString('There was an error adding this email address.'));
      });
    };

    $scope.resendValidationEmail = function (email) {
      $scope.user.resendValidationEmail(email, function (resp) {
        alertService.add('success', gettextCatalog.getString('Validation email sent successfully.'));
      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error sending the validation email.'));
      });
    };

    $scope.updateLocation = function (location) {
      angular.copy(location.location, $scope.user.location);

      $scope.user.$update(function () {
        alertService.add('success', gettextCatalog.getString('Location successfully updated.'));
        var message = $scope.user.location.country.name;
        if ($scope.user.location.region) {
          message = $scope.user.location.region.name + ', ' + $scope.user.location.country.name;
        }

        $scope.modifications.location = 'Changed location to: ' + message;
        $scope.editLocationForm.$visible = false;

      }, function (resp) {
        alertService.add('danger', gettextCatalog.getString('There was an error: ') + resp.data.error);
      });
    };

    $scope.addOrganization = function () {
      UserCheckInService.save({userId: $scope.user._id, listType: 'organizations'}, {list: $scope.newOrganization.list._id}, function (user) {
        $scope.user.organizations = user.organizations;
        alertService.add('success', gettextCatalog.getString('Organization successfully updated.'));
        $scope.modifications.location = 'Changed organization to: ' + $scope.newOrganization.list.name;
      });
    };

  }
})();
