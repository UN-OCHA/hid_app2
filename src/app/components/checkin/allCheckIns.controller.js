(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('AllCheckInsCtrl', AllCheckInsCtrl);

  AllCheckInsCtrl.$inject = ['$scope', 'alertService', 'config', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];
  
  function AllCheckInsCtrl ($scope, alertService, config, UserCheckInService, UserDataService, gettextCatalog) {
    $scope.listsMember = [];
    $scope.leaveList = leaveList;
    $scope.page = 1;
    $scope.itemsPerPage = 10;
    $scope.listSearchTerm = {
      name: ''
    };

    function leaveList (checkin) {
      alertService.add('warning', 'Are you sure?', true, function() {
        UserCheckInService.delete({userId: $scope.currentUser._id, listType: checkin.type + 's', checkInId: checkin._id}, {}, function (user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list'));
          $scope.listsMember.splice($scope.listsMember.indexOf(checkin), 1);
          UserDataService.notify();
          $scope.setCurrentUser(user);
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error checking out of this list'));
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
