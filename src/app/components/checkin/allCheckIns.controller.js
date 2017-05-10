(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('AllCheckInsCtrl', AllCheckInsCtrl);

  AllCheckInsCtrl.$inject = ['$exceptionHandler', '$scope', '$uibModal', 'alertService', 'config', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];

  function AllCheckInsCtrl ($exceptionHandler, $scope, $uibModal, alertService, config, UserCheckInService, UserDataService, gettextCatalog) {
    $scope.listsMember = [];
    $scope.leaveList = leaveList;
    $scope.editCheckIn = editCheckIn;
    $scope.showDatePicker = showDatePicker;
    $scope.updateCheckIn = updateCheckIn;
    $scope.closeEditModal = closeEditModal;
    $scope.removeCheckOutDate = removeCheckOutDate;
    $scope.page = 1;
    $scope.itemsPerPage = 10;
    $scope.listSearchTerm = {
      name: ''
    };
    $scope.datePicker = {
      opened: false
    };
    $scope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };
    var editModal;

    function showDatePicker () {
      $scope.datePicker.opened = true;
    }

    function saveCheckIn (checkIn, checkInUser) {
      UserCheckInService.update({userId: $scope.currentUser._id, listType: checkIn.type + 's', checkInId: checkIn._id}, checkInUser, function (user) {
        $scope.setCurrentUser(user);
        angular.forEach($scope.listsMember, function (list) {
          if (list._id === checkInUser.list) {
            list.checkoutDate = checkInUser.checkoutDate;
          }
        });
        editModal.close();
      }, function (error) {
        alertService.add('danger', gettextCatalog.getString('There was an error saving'));
        $exceptionHandler(error, 'Update checkout date');
      });
    }

    function removeCheckOutDate (checkIn) {
      var checkInUser = {
        list: checkIn._id,
        checkoutDate: null
      };
      saveCheckIn(checkIn, checkInUser);
    }

    function updateCheckIn (checkIn) {
      if (!checkIn.departureDate) {
        editModal.close();
        return;
      }

      var checkInUser = {
        list: checkIn._id,
        checkoutDate: checkIn.departureDate
      };

      saveCheckIn(checkIn, checkInUser);
    }

    function editCheckIn (checkIn) {
      $scope.editingCheckIn = checkIn;
      $scope.currentCheckoutDate = checkIn.checkoutDate ? moment(checkIn.checkoutDate).format('DD MMMM YYYY') : '';
      openEditModal();
    }

    function openEditModal () {
      editModal = $uibModal.open({
        scope: $scope,
        size: 'sm',
        templateUrl: 'app/components/checkin/editCheckinModal.html',
      });

      editModal.result.then(function () {
        return;
      }, function () {
        return;
      });
    }

    function closeEditModal () {
      editModal.close();
    }

    function leaveList (checkIn) {
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        UserCheckInService.delete({userId: $scope.currentUser._id, listType: checkIn.type + 's', checkInId: checkIn._id}, {}, function (user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list'), false, function(){});
          $scope.listsMember = $scope.listsMember.filter(function(list) {
            return list._id !== checkIn._id;
          });
          UserDataService.notify();
          $scope.setCurrentUser(user);
        }, function () {
          alertService.add('danger', gettextCatalog.getString('There was an error checking out of this list'), false, function(){});
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
