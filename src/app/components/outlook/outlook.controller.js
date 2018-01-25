(function () {
  'use strict';

  angular
    .module('app.outlook')
    .controller('OutlookCtrl', OutlookCtrl);

  OutlookCtrl.$inject = ['$scope', '$location', '$routeParams', 'User', 'gettextCatalog', 'alertService'];

  function OutlookCtrl ($scope, $location, $routeParams, User, gettextCatalog, alertService) {

    var hash = $location.hash().split('&');
    if (hash[0].indexOf('code') === 0) {
      var code = hash[0].split('=');
      $scope.currentUser.saveOutlookCredentials(code[1])
        .then(function (resp) {
          $location.path('/');
        });
    }
  }
})();
