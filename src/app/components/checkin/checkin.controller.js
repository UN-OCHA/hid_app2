(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinCtrl', CheckinCtrl);

  CheckinCtrl.$inject = ['$scope', '$routeParams', '$filter', '$q', '$location', 'gettextCatalog', 'config', 'alertService', 'User', 'UserCheckInService', 'List', 'Service'];

  function CheckinCtrl ($scope, $routeParams, $filter, $q, $location, gettextCatalog, config, alertService, User, UserCheckInService, List, Service) {
    $scope.request = $routeParams;
    $scope.organization = {};
    $scope.selectedLists = [];
    $scope.modifications = {};
    $scope.listTypes = [];
    $scope.selectedTypes = {
      name: 'all'
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
    $scope.isCurrentUser = true;
    $scope.lists = [];
    $scope.associatedLists = [];
    $scope.showAllAssociated = false;
    var searchTerm = '';

    function getListTypes () {
      angular.forEach(config.listTypes, function (listType) {

        var label = listType.charAt(0).toUpperCase() + listType.slice(1);
        if (listType === 'bundle') {
          label = 'Group';
        }
        if (listType === 'functional_role') {
          label = 'Role'
        }
        if (listType === 'list') {
          return;
        }
        $scope.listTypes.push(
          {
            name: listType,
            label: label
          }
        );
      });
    }

    function isListMember (list, user) {
      var inList = false;
      angular.forEach(config.listTypes, function (listType) {
        angular.forEach(user[listType + 's'], function (userList) {
          if (list._id === userList.list._id) {
            return inList = true;
          }
        });
      });
      return inList;
    }

    function isSelected (selectedLists, list) {
      var listSelected = false;
      angular.forEach(selectedLists, function(selectedList) {
        if (list._id === selectedList._id) {
          return listSelected = true;
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
        promises.push(List.query({limit: 20, 'metadata.operation.id' : operationId}).$promise)
      })
      return $q.all(promises).then(function(data) {
        return data;
      }, function (error) {
        $log.error(error);
      });
    }

    function getListOperations (list) {
      var operations = [];

      // If an operation, get its id
      if (list.type === 'operation') {
        operations.push(list.remote_id);
        return operations;
      }

      // If no associated operations return
      if (!list.metadata.operation) {
        return;
      }

      // Get all the associated operations
      angular.forEach(list.metadata.operation, function(operation) {
        operations.push(operation.id);
      });

      return operations;
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
        return
      }

      //Otherwise user the associated operations
      getAssociatedLists(getListOperations(list)).then(function (listsArray) {          
        var mergedLists = Array.prototype.concat.apply([], listsArray);
        $scope.associatedLists = filterLists(mergedLists, $scope.selectedLists, $scope.user);
      });
    }

    function getUser () {
      var userId = $routeParams.userId ? $routeParams.userId : $scope.currentUser._id;
      User.get({userId: userId}, function (user) {
        $scope.user = angular.copy(user);
        $scope.isCurrentUser = $scope.currentUser._id === $scope.user._id;
        $scope.$broadcast('userLoaded');
      });
    }
    
    $scope.getLists = function(search) {
      if (search === '') {
        return;
      }
      searchTerm = search;
      var params = {
        name: search
      };
      if ($scope.selectedTypes.name !== 'all') {
        params.type = $scope.selectedTypes.name;
      }

      List.query(params, function (lists) {
        $scope.lists = filterLists(lists, $scope.selectedLists, $scope.user);
      });
    };

    $scope.addList = function (list) {
      $scope.selectedLists.push(list);
      $scope.associatedLists.splice($scope.associatedLists.indexOf(list), 1);
    }

    $scope.selectList = function (list) {
      $scope.selectedLists.push(list);
      showAssociatedLists(list, searchTerm);
    };

    $scope.removeList = function (list) {
      $scope.selectedLists.splice($scope.selectedLists.indexOf(list), 1);
    };

    $scope._checkinHelper = function () {
      var defer = $q.defer();
      var promises = [];

      function lastTask(){
        if ($scope.currentUser._id === $scope.user._id) {
          $scope.user = User.get({userId: $scope.currentUser._id}, function () {
            $scope.setCurrentUser($scope.user);
            defer.resolve();

            var listIds = $scope.selectedLists.map(function (list) {
              return list._id.toString();
            });

            Service.getSuggestions(listIds.join(','), $scope.currentUser).$promise.then(function (services) {
              if (Service.suggestedServices.length) {
                $location.path('services/suggestions').search({lists: listIds.join(',') });
                return;
              }
              
              alertService.add('success', 'You were successfully checked in');
              $location.path('/dashboard');
            });
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

    function init() {
      getUser();
      getListTypes();
    }

    init();

  }
})();
