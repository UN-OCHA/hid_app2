(function () {
  'use strict';

  angular
    .module('app.auth')
    .controller('VerifyCtrl', VerifyCtrl);

  VerifyCtrl.$inject = ['$scope', '$location', '$routeParams', 'User', 'gettextCatalog', 'alertService'];

  function VerifyCtrl ($scope, $location, $routeParams, User, gettextCatalog, alertService) {
    User.validateEmail($location.search(), function (response) {
      alertService.add('success', gettextCatalog.getString('Thank you for confirming your email. You can now login through our application, or through any other application using Humanitarian ID'));
      $location.path('/');
    }, function (response) {
      alertService.add('danger', gettextCatalog.getString('The confirmation link did not work'));
    });
  }
})();
