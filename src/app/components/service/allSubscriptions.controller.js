(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('AllSubscriptionsCtrl', AllSubscriptionsCtrl);

  AllSubscriptionsCtrl.$inject = ['$scope', 'alertService', 'Service'];
  
  function AllSubscriptionsCtrl ($scope, alertService, Service) {
    $scope.unsubscribe = unsubscribe;
    $scope.page = 1;
    $scope.itemsPerPage = 10;
    $scope.subscriptionSearchTerm = {
      service: {
        name: ''
      }
    };

    function unsubscribe (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', 'Are you sure?', true, function() {
        service.unsubscribe($scope.currentUser)
          .then(function (response) {
            $scope.setCurrentUser(response.data);
            alertService.add('success','You were successfully unsubscribed from this service');
          })
          .catch(function (err) {
            alertService.add('danger', 'We could not unsubscribe you from this service');
          });
      });
    }
  }

})();
