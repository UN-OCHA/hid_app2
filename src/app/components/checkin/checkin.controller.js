(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinCtrl', CheckinCtrl);

  CheckinCtrl.$inject = ['$scope', '$routeParams', '$q', 'gettextCatalog', 'config', 'hrinfoService', 'alertService', 'User', 'UserCheckInService', 'List'];

  function CheckinCtrl ($scope, $routeParams, $q, gettextCatalog, config, hrinfoService, alertService, User, UserCheckInService, List) {
    $scope.request = $routeParams;
    $scope.step = 1;
    $scope.organization = {};
    $scope.selectedLists = [];

    var queryCallback = function () {
      angular.copy($scope.user.organization, $scope.organization);
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

    }
    getUser();

    $scope.updateSelectedLists = function (list) {
      $scope.selectedLists.push(list);
    }

    $scope.removeList = function (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    }

    $scope.isSelected = function (list) {
      return $scope.selectedLists.indexOf(list) !== -1;
    }

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
    $scope.setRegions = function ($item, $model) {
      $scope.regions = [];
      hrinfoService.getRegions($item.id).then(function (regions) {
        $scope.regions = regions;
      });
    };

    $scope._checkinHelper = function () {
      var selectedLists = $scope.selectedLists;
      var checkinUser = {}, prom = [];
      for (var i = 0, len = selectedLists.length; i < len; i++) {
        checkinUser = {
          list: selectedLists[i]._id,
          checkoutDate: $scope.departureDate
        };
        UserCheckIn.save({userId: $scope.user._id, listType: selectedLists[i].type + 's'}, checkinUser, function (out) {
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
      if ($scope.organization.list && (!$scope.user.organization.list || $scope.organization.list._id != $scope.user.organization.list._id)) {
        checkinUser = {
          list: $scope.organization.list._id,
        };
        if ($scope.user.organization.list) {
          // Check out from the old organization
          UserCheckIn.delete({userId: $scope.user._id, listType: 'organization', checkInId: $scope.user.organization._id}, {}, function (user) {
            UserCheckIn.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function (out) {
              $scope._checkinHelper();
            });
          });
        }
        else {
          UserCheckIn.save({userId: $scope.user._id, listType: 'organization'}, checkinUser, function (out) {
            $scope._checkinHelper();
          });
        }
      }
      else {
        $scope._checkinHelper();
      }
    };
  }
})();
