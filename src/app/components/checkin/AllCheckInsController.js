(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('AllCheckInsController', AllCheckInsController);

  AllCheckInsController.$inject = ['$exceptionHandler', '$scope', '$uibModal', 'alertService', 'config', 'UserCheckInService', 'UserDataService', 'gettextCatalog'];

  function AllCheckInsController ($exceptionHandler, $scope, $uibModal, alertService, config, UserCheckInService, UserDataService, gettextCatalog) {
    var thisScope = $scope;
    thisScope.listsMember = [];
    thisScope.leaveList = leaveList;
    thisScope.editCheckIn = editCheckIn;
    thisScope.showDatePicker = showDatePicker;
    thisScope.updateCheckIn = updateCheckIn;
    thisScope.closeEditModal = closeEditModal;
    thisScope.removeCheckOutDate = removeCheckOutDate;
    thisScope.page = 1;
    thisScope.itemsPerPage = 10;
    thisScope.listSearchTerm = {
      name: ''
    };
    thisScope.datePicker = {
      opened: false
    };
    thisScope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };
    var editModal;

    function showDatePicker () {
      thisScope.datePicker.opened = true;
    }

    function saveCheckIn (checkIn, checkInUser) {
      UserCheckInService.update({userId: thisScope.currentUser._id, listType: checkIn.type + 's', checkInId: checkIn._id}, checkInUser, function (user) {
        thisScope.setCurrentUser(user);
        angular.forEach(thisScope.listsMember, function (list) {
          if (list._id === checkInUser.list) {
            list.checkoutDate = checkInUser.checkoutDate;
          }
        });
        editModal.close();
      }, function (error) {
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
      thisScope.editingCheckIn = checkIn;
      thisScope.currentCheckoutDate = checkIn.checkoutDate ? moment(checkIn.checkoutDate).format('DD MMMM YYYY') : '';
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
        UserCheckInService.delete({userId: thisScope.currentUser._id, listType: checkIn.type + 's', checkInId: checkIn._id}, {}, function (user) {
          alertService.add('success', gettextCatalog.getString('Successfully removed from list'), false, function(){});
          thisScope.listsMember = thisScope.listsMember.filter(function(list) {
            return list._id !== checkIn._id;
          });
          UserDataService.notify();
          thisScope.setCurrentUser(user);
        }, function (error) {
          $exceptionHandler(error, 'Leaving list');
        });
      });
    }

    function getUserLists () {
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(thisScope.currentUser[listType + 's'], function (val) {
          val.type = listType;
          thisScope.listsMember.push(val);
        });
      });
    }

    getUserLists();
  }

})();
