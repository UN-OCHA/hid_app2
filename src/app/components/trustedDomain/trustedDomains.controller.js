(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('TrustedDomainsCtrl', TrustedDomainsCtrl);

  TrustedDomainsCtrl.$inject = ['$scope', '$routeParams', 'gettextCatalog', 'alertService', 'TrustedDomain'];

  function TrustedDomainsCtrl ($scope, $routeParams, gettextCatalog, alertService, TrustedDomain) {
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };

    var setTotalDomains = function (domains, headers) {
      $scope.pagination.totalItems = headers()["x-total-count"];
    };

    function getTrustedDomains (offset) {
      var params = {
        limit: $scope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      TrustedDomain.query(params, function (domains, headers) {
        setTotalDomains(domains, headers);
        $scope.domains = domains;
      });
    }

    getTrustedDomains();

    $scope.pageChanged = function () {
      var offset = $scope.pagination.itemsPerPage * ($scope.pagination.currentPage - 1);
      getTrustedDomains(offset);
    };

    $scope.addedDomain = new TrustedDomain();

    $scope.newDomain = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Domain saved successfully'));
        $scope.addedDomain = new TrustedDomain();
        $scope.pageChanged();
      };
      var error = function (err) {
        $exceptionHandler(error, 'Save domain');
      };
      $scope.addedDomain.$save(success, error);
    };

    $scope.deleteDomain = function (domain) {
      domain.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Domain deleted successfully'));
        $scope.pageChanged();
      });
    };

  }
})();
