(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('AllSubscriptionsController', AllSubscriptionsController);

  AllSubscriptionsController.$inject = ['$exceptionHandler', '$scope', 'alertService', 'Service', 'gettextCatalog'];

  function AllSubscriptionsController ($exceptionHandler, $scope, alertService, Service, gettextCatalog) {
    var thisScope = $scope;

    thisScope.unsubscribe = unsubscribe;
    thisScope.page = 1;
    thisScope.itemsPerPage = 10;
    thisScope.subscriptionSearchTerm = {
      service: {
        name: ''
      }
    };

    function unsubscribe (subscription) {
      var service = new Service(subscription.service);
      alertService.add('warning', gettextCatalog.getString('Are you sure?'), true, function() {
        service.unsubscribe(thisScope.currentUser)
          .then(function (response) {
            thisScope.setCurrentUser(response.data);
            alertService.add('success', gettextCatalog.getString('You were successfully unsubscribed from this service'));
          })
          .catch(function (err) {
            $exceptionHandler(error, 'Unsubscribe');
          });
      });
    }
  }

})();
