(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinCtrl', CheckinCtrl);

  CheckinCtrl.$inject = ['$scope', '$routeParams', '$filter', '$q', 'gettextCatalog', 'config', 'alertService', 'User', 'UserCheckInService', 'List'];

  function CheckinCtrl ($scope, $routeParams, $filter, $q, gettextCatalog, config, alertService, User, UserCheckInService, List) {
    $scope.request = $routeParams;
    $scope.organization = {};
    $scope.selectedLists = [];
    $scope.modifications = {};
    $scope.datePicker = {
      opened: false
    };
    $scope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };
    $scope.isCurrentUser = true;
    $scope.lists = [];

    var queryCallback = function () {
      $scope.isCurrentUser = $scope.currentUser._id === $scope.user._id;
      $scope.$broadcast('userLoaded');

      $scope.lists = List.query({}, function() {
        $scope.lists = $scope.lists.filter(function (list) {
          var out = true, listType = '';
          for (var i = 0, len = config.listTypes.length; i < len; i++) {
            listType = config.listTypes[i] + 's';
            if (!$scope.user[listType]) {
              $scope.user[listType] = [];
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
      var userId = $routeParams.userId ? $routeParams.userId : $scope.currentUser._id;
      $scope.user = User.get({userId: userId}, queryCallback);
    }
    getUser();

    $scope.getLists = function(search) {
      $scope.lists = List.query({'name': search});
    };

    $scope.updateSelectedLists = function (list) {
      $scope.selectedLists.push(list);
    };

    $scope.removeList = function (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    };

    $scope.isSelected = function (list) {
      return $scope.selectedLists.indexOf(list) !== -1;
    };

    $scope._checkinHelper = function () {
      var defer = $q.defer();
      var promises = [];

      function lastTask(){
        if ($scope.currentUser._id === $scope.user._id) {
          $scope.user = User.get({userId: $scope.currentUser._id}, function () {
            $scope.setCurrentUser($scope.user);
            alertService.add('success', gettextCatalog.getString('You were succesfully checked in'));
            defer.resolve();
          });
        }
        else {
          alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully checked in'));
          defer.resolve();
        }
      }

      function checkinOneList (list) {
        var checkinUser = {
          list: list._id,
          checkoutDate: $scope.departureDate
        };
        return UserCheckInService.save({userId: $scope.user._id, listType: list.type + 's'}, checkinUser).$promise;
      }

      angular.forEach($scope.selectedLists, function(value){
          promises.push(checkinOneList(value));
      });

      $q.all(promises).then(lastTask);
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

    $scope.showDatePicker = function() {
      $scope.datePicker.opened = true;
    };

    $scope.$on('editUser', function (event, data) {

      if (data.status === 'fail') {
        alertService.add('danger', data.message);
        return;
      }

      if (data.status === 'success') {
        alertService.add('success', data.message);

        if (data.type === 'primaryOrganization') {
          $scope.modifications.organization = 'Changed primary organization to: ' + $scope.user.organization.list.name;
        }

        if (data.type === 'primaryPhone') {
          $scope.modifications.phone = 'Changed primary phone number to: ' + $scope.user.phone_number;
        }

        if (data.type === 'primaryEmail') {
          $scope.modifications.email = 'Changed primary email to: ' + $scope.user.email;
        }

        if (data.type === 'primaryLocation') {
          $scope.modifications.location = 'Changed primary location to: ' + $scope.user.location.country.name;
        }

        if (data.type === 'primaryJobTitle') {
          $scope.modifications.job_title = 'Changed primary job title to: ' + $scope.user.job_title;
        }

        return;
      }

    });

  }
})();
