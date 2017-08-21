(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('AllSubscriptionsCtrl', AllSubscriptionsCtrl);

  AllSubscriptionsCtrl.$inject = ['$exceptionHandler', '$scope', 'alertService', 'Service', 'gettextCatalog'];

  function AllSubscriptionsCtrl ($exceptionHandler, $scope, alertService, Service, gettextCatalog) {
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
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.unsubscribe($scope.currentUser)
          .then(function (response) {
            $scope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'));
          })
          .catch(function (err) {
            $exceptionHandler(error, 'Unsubscribe');
          });
      });
    }
  }

})();
