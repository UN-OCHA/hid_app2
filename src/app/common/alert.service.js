(function () {
  'use strict';

  angular
  .module('app.common')
  .factory('alertService', alertService);

  alertService.$inject = ['$rootScope', 'confirmDialog'];

  function alertService($rootScope, confirmDialog) {

    var alertService = {};

    // create an array of alerts available globally
    $rootScope.alerts = [];

    alertService.add = function(type, msg, confirm, cb) {
      confirm = confirm || false;
      cb = cb || false;

      // Show confirm dialog instead of alert
      if (confirm) {
        return confirmDialog(msg).then(function () {
          return cb();
        }, function () {
          return;
        });
      }

      var closeAlert = function () {
        alertService.closeAlert(this);
      };
      var alert = {
        'type': type,
        'msg': msg,
        'close': closeAlert,
        'routes': 1,
        'callback': cb,
      };

      $rootScope.alerts.push(alert);
      return alert;
    };

    alertService.closeAlert = function(alert) {
      var i = $rootScope.alerts.indexOf(alert);
      $rootScope.alerts.splice(i, 1);
    };

    alertService.nextRoute = function() {
      for (var i = $rootScope.alerts.length - 1; i >= 0; i--) {
        if ($rootScope.alerts[i].routes > 1) {
          $rootScope.alerts.splice(i,1);
        }
        else {
          $rootScope.alerts[i].routes++;
        }
      }
    };

    return alertService;

  }

})();

