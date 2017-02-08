(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('AllCheckInsCtrl', AllCheckInsCtrl);

  AllCheckInsCtrl.$inject = ['$scope', 'alertService', 'config', 'UserCheckInService', 'UserDataService'];
  
  function AllCheckInsCtrl ($scope, alertService, config, UserCheckInService, UserDataService) {
    $scope.listsMember = [];
    $scope.leaveList = leaveList;
    $scope.page = 1;
    $scope.itemsPerPage = 10;
    $scope.listSearchTerm = {
      name: ''
    };

    function leaveList (checkin) {
      alertService.add('warning', 'Are you sure?', true, function() {
        UserCheckInService.delete({userId: $scope.currentUser._id, listType: checkin.type + 's', checkInId: checkin._id}, {}, function () {
          alertService.add('success', 'Successfully removed from list');
          $scope.listsMember.splice($scope.listsMember.indexOf(checkin), 1);
          UserDataService.notify();
        }, function () {
          alertService.add('danger', 'There was an error checking out of this list');
        });
      });
    }

    function getUserLists () {
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach($scope.currentUser[listType + 's'], function (val) {
          val.type = listType;
          $scope.listsMember.push(val);
        });
      });
    }

    getUserLists();
  }

})();
