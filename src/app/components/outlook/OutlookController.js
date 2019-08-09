(function () {
  'use strict';

  angular
    .module('app.outlook')
    .controller('OutlookController', OutlookController);

  OutlookController.$inject = ['$scope', '$location', '$routeParams', 'User', 'gettextCatalog', 'alertService'];

  function OutlookController ($scope, $location, $routeParams, User, gettextCatalog, alertService) {
    var thisScope = $scope;

    var hash = $location.hash().split('&');
    if (hash[0].indexOf('code') === 0) {
      var code = hash[0].split('=');
      thisScope.currentUser.saveOutlookCredentials(code[1])
        .then(function (resp) {
          $location.path('/');
        });
    }
  }
})();
