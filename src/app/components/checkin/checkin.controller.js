(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinCtrl', CheckinCtrl);

  CheckinCtrl.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$filter', '$q', '$location', '$uibModal', 'gettextCatalog', 'config', 'alertService', 'User', 'UserDataService', 'UserCheckInService', 'List', 'Service'];

  function CheckinCtrl ($exceptionHandler, $scope, $routeParams, $filter, $q, $location, $uibModal, gettextCatalog, config, alertService, User, UserDataService, UserCheckInService, List, Service) {
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
    $scope.associatedLists = [];
    $scope.showAllAssociated = false;
    $scope.saving = false;
    $scope.selectedLists = []; // used by nested select lists controller
    $scope.filterListsMember = true; // used by nested select lists controller

    function isListMember (list, user) {
      var inList = false;
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (list._id === userList.list) {
            inList = true;
            return inList;
          }
        });
      });
      return inList;
    }

    function isSelected (selectedLists, list) {
      var listSelected = false;
      angular.forEach(selectedLists, function(selectedList) {
        if (list._id === selectedList._id) {
          listSelected = true;
          return listSelected;
        }
      });
      return listSelected;
    }

    function filterLists (lists, selectedLists, user) {
      var filteredLists = lists.filter(function (list) {
        return !isListMember(list, user) && !isSelected(selectedLists, list);
      });
      return filteredLists;
    }

    function getAssociatedLists (operations) {
      var promises = [];
       angular.forEach(operations, function(operationId) {
        promises.push(List.query({limit: 20, 'metadata.operation.id' : operationId}).$promise);
      });
      return $q.all(promises).then(function(data) {
        return data;
      }, function (error) {
        $exceptionHandler(error, 'getAssociatedLists');
      });
    }

    function showAssociatedLists (list, searchTerm) {
      if (list.type === 'role' || list.type === 'list') {
        return;
      }

      //Use the search term to get associated lists if an organisation
      if (list.type === 'organization') {
        List.query({name: searchTerm, limit: 20}, function (lists) {
          $scope.associatedLists = filterLists(lists, $scope.selectedLists, $scope.user);
        });
        return;
      }

      //Otherwise user the associated operations
      getAssociatedLists(list.associatedOperations()).then(function (listsArray) {          
        var mergedLists = Array.prototype.concat.apply([], listsArray);
        $scope.associatedLists = filterLists(mergedLists, $scope.selectedLists, $scope.user);
      });
    }

    function getUser () {
      var userId = $routeParams.userId ? $routeParams.userId : $scope.currentUser._id;
      UserDataService.getUser(userId, function () {
        $scope.user = UserDataService.user;
        $scope.isCurrentUser = $scope.currentUser._id === $scope.user._id;
        $scope.$broadcast('userLoaded'); 
      }, function (error) {
        $exceptionHandler(error, 'getUser');
      });
    }
    
    $scope.addList = function (list) {
      $scope.selectedLists.push(list);
      $scope.associatedLists.splice($scope.associatedLists.indexOf(list), 1);
    };

    $scope.$on('selectList', function (evt, data) {
      showAssociatedLists(data.list, data.searchTerm);
    });

    $scope.checkin = function () {
      var defer = $q.defer();
      var promises = [];
      $scope.saving = true;

      function lastTask(){
        if ($scope.currentUser._id === $scope.user._id) {
          $scope.user = User.get({userId: $scope.currentUser._id}, function () {
            $scope.setCurrentUser($scope.user);
            defer.resolve();
            var moderatedLists = false;
            var listIds = $scope.selectedLists.map(function (list) {
              if (list.joinability === 'moderated') {
                moderatedLists = true;
              }
              return list._id.toString();
            });

            Service.getSuggestions(listIds.join(','), $scope.currentUser).$promise.then(function () {
              if (Service.suggestedServices.length) {
                $location.path('services/suggestions').search({lists: listIds.join(',') });
                return;
              }
              
              var message = 'You were successfully checked in.';
              if (moderatedLists) {
                message += ' Some of you check-ins are pending, we will get back to you soon.';
              }
              alertService.add('success', message);
              $scope.saving = false;
              $location.path('/dashboard');
            });
          });
        }
        else {
          alertService.add('success', $scope.user.name + gettextCatalog.getString(' was successfully checked in'));
          $scope.saving = false;
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

      $q.all(promises).then(lastTask, function (error) {
        alertService.add('danger', 'Unable to check in');
        $exceptionHandler(error, 'Checkin');
      });
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
        UserDataService.formatUserLocations();

        if (data.type === 'primaryOrganization') {
          $scope.modifications.organization = 'Changed primary organization to: ' + $scope.user.organization.name;
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
    var listTypesModal;

    
    $scope.openListTypesModal = function () {
     listTypesModal = $uibModal.open({
        animation: false,
        size: 'lg',
        scope: $scope,
        templateUrl: 'app/components/checkin/listTypesModal.html'
      });

      listTypesModal.result.then(function () {
        return;
      }, function () {
        return;
      });
    };

    $scope.closeListTypesModal = function () {
      listTypesModal.close();
    };

    function init() {
      getUser();
    }

    init();

  }
})();
