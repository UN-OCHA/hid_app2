(function () {
  'use strict';

  angular
    .module('app.checkin')
    .controller('CheckinController', CheckinController);

  CheckinController.$inject = ['$exceptionHandler', '$scope', '$routeParams', '$filter', '$q', '$location', '$uibModal', 'gettextCatalog', 'config', 'alertService', 'User', 'UserDataService', 'UserCheckInService', 'List', 'Service'];

  function CheckinController ($exceptionHandler, $scope, $routeParams, $filter, $q, $location, $uibModal, gettextCatalog, config, alertService, User, UserDataService, UserCheckInService, List, Service) {
    var thisScope = $scope;
    thisScope.modifications = {};
    thisScope.datePicker = {
      opened: false
    };
    thisScope.dateOptions = {
      maxDate: moment().add(5, 'year')._d,
      minDate: new Date(),
      showWeeks: false,
      startingDay: 1
    };
    thisScope.isCurrentUser = true;
    thisScope.lists = [];
    thisScope.associatedLists = [];
    thisScope.showAllAssociated = false;
    thisScope.saving = false;
    thisScope.selectedLists = []; // used by nested select lists controller
    thisScope.filterListsMember = true; // used by nested select lists controller
    thisScope.checkInOnly = true; // used by nested select lists controller

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
          thisScope.associatedLists = filterLists(lists, thisScope.selectedLists, thisScope.user);
        });
        return;
      }

      //Otherwise user the associated operations
      getAssociatedLists(list.associatedOperations()).then(function (listsArray) {
        var mergedLists = Array.prototype.concat.apply([], listsArray);
        thisScope.associatedLists = filterLists(mergedLists, thisScope.selectedLists, thisScope.user);
      });
    }

    function getUser () {
      var userId = $routeParams.userId ? $routeParams.userId : thisScope.currentUser._id;
      UserDataService.getUserFromServer(userId).then(function (user) {
        thisScope.user = user;
        thisScope.isCurrentUser = thisScope.currentUser._id === thisScope.user._id;
        thisScope.$broadcast('userLoaded');
      })
      .catch(function (error) {
        $exceptionHandler(error, 'getUser');
      });
    }

    thisScope.addList = function (list) {
      thisScope.selectedLists.push(list);
      thisScope.associatedLists.splice(thisScope.associatedLists.indexOf(list), 1);
    };

    thisScope.$on('selectList', function (evt, data) {
      showAssociatedLists(data.list, data.searchTerm);
    });

    thisScope.checkin = function () {
      var defer = $q.defer();
      var promises = [];
      thisScope.saving = true;

      function lastTask(){
        thisScope.user = User.get({userId: thisScope.user._id}, function () {
          if (thisScope.currentUser._id === thisScope.user._id) {
            thisScope.setCurrentUser(thisScope.user);
          }
          defer.resolve();
          var moderatedLists = false;
          var listIds = thisScope.selectedLists.map(function (list) {
            if (list.joinability === 'moderated') {
              moderatedLists = true;
            }
            return list._id.toString();
          });

          Service.getSuggestions(listIds.join(','), thisScope.user).$promise.then(function () {
            if (Service.suggestedServices.length) {
              if (thisScope.currentUser._id === thisScope.user._id) {
                $location.path('services/suggestions').search({lists: listIds.join(',') });
              }
              else {
                $location.path('services/suggestions/' + thisScope.user._id).search({lists: listIds.join(',')});
              }
              return;
            }

            if (thisScope.currentUser._id === thisScope.user._id) {
              var message = gettextCatalog.getString('You were successfully checked in.');
              if (moderatedLists) {
                message += ' ' + gettextCatalog.getString('Some of you check-ins are pending, we will get back to you soon.');
              }
              alertService.add('success', message);
              thisScope.saving = false;
              $location.path('/dashboard');
            }
            else {
              alertService.add('success', thisScope.user.name + gettextCatalog.getString(' was successfully checked in'));
              thisScope.saving = false;
              defer.resolve();
            }
          });
        });
      }

      function checkinOneList (list) {
        var checkinUser = {
          list: list._id,
          checkoutDate: thisScope.departureDate
        };
        return UserCheckInService.save({userId: thisScope.user._id, listType: list.type + 's'}, checkinUser).$promise;
      }

      angular.forEach(thisScope.selectedLists, function(value){
          promises.push(checkinOneList(value));
      });

      $q.all(promises).then(lastTask, function (error) {
        $exceptionHandler(error, 'Checkin');
      });
    };

    thisScope.showDatePicker = function() {
      thisScope.datePicker.opened = true;
    };

    thisScope.$on('editUser', function (event, data) {

      if (data.status === 'fail') {
        alertService.add('danger', data.message);
        return;
      }

      if (data.status === 'success') {
        alertService.add('success', data.message);
        UserDataService.formatUserLocations();

        if (data.type === 'primaryOrganization') {
          thisScope.modifications.organization = gettextCatalog.getString('Changed primary organization to: ') + thisScope.user.organization.name;
        }

        if (data.type === 'primaryPhone') {
          thisScope.modifications.phone = gettextCatalog.getString('Changed primary phone number to: ') + thisScope.user.phone_number;
        }

        if (data.type === 'primaryEmail') {
          thisScope.modifications.email = gettextCatalog.getString('Changed primary email to: ') + thisScope.user.email;
        }

        if (data.type === 'primaryLocation') {
          thisScope.modifications.location = gettextCatalog.getString('Changed primary location to: ') + thisScope.user.location.country.name;
        }

        if (data.type === 'primaryJobTitle') {
          thisScope.modifications.job_title = gettextCatalog.getString('Changed primary job title to: ') + thisScope.user.job_title;
        }

        return;
      }

    });
    var listTypesModal;


    thisScope.openListTypesModal = function () {
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

    thisScope.closeListTypesModal = function () {
      listTypesModal.close();
    };

    function init() {
      getUser();
    }

    init();

  }
})();
