(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('offlineStatus', offlineStatus);

  offlineStatus.$inject = ['$timeout', 'gettextCatalog'];

  function offlineStatus($timeout, gettextCatalog) {

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {},
      templateUrl: 'app/components/offlineStatus/offline-status.html',
      link: function (scope) {

        var downMessage = gettextCatalog.getString('Your device lost its internet connection.');
        var upMessage = gettextCatalog.getString('Your device is connected to the internet');

        scope.offline = {
          message: '',
          showStatus: false,
          status: ''
        };

        Offline.on('up', function () {
          scope.$apply(function () {
            scope.offline.message = upMessage;
            scope.offline.showStatus = true;
            scope.offline.status = 'up';
          });

          $timeout(function () {
            scope.offline.showStatus = false;
          }, 2000);
        });

        Offline.on('down', function () {
          scope.$apply(function () {
            scope.offline.message = downMessage;
            scope.offline.showStatus = true;
            scope.offline.status = 'down';
          });
        });

        scope.closeStatus = function () {
          scope.offline.showStatus = false;
        };


      }
    };

    return directive;
  }
})();
