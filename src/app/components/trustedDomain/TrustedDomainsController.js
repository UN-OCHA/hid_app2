(function () {
  'use strict';

  angular
    .module('app.client')
    .controller('TrustedDomainsController', TrustedDomainsController);

  TrustedDomainsController.$inject = ['$scope', '$routeParams', 'gettextCatalog', 'alertService', 'TrustedDomain', 'List'];

  function TrustedDomainsController ($scope, $routeParams, gettextCatalog, alertService, TrustedDomain, List) {
    var thisScope = $scope;

    thisScope.pagination = {
      currentPage: 1,
      itemsPerPage: 100,
      totalItems: 0
    };

    var setTotalDomains = function (domains, headers) {
      thisScope.pagination.totalItems = headers()["x-total-count"];
    };

    function getTrustedDomains (offset) {
      var params = {
        limit: thisScope.pagination.itemsPerPage
      };
      params.offset = offset || 0;

      TrustedDomain.query(params, function (domains, headers) {
        setTotalDomains(domains, headers);
        thisScope.domains = domains;
      });
    }

    getTrustedDomains();

    thisScope.pageChanged = function () {
      var offset = thisScope.pagination.itemsPerPage * (thisScope.pagination.currentPage - 1);
      getTrustedDomains(offset);
    };

    thisScope.addedDomain = new TrustedDomain();

    thisScope.newDomain = function() {
      var success = function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Domain saved successfully'));
        thisScope.addedDomain = new TrustedDomain();
        thisScope.pageChanged();
      };
      var error = function (err) {
        $exceptionHandler(error, 'Save domain');
      };
      thisScope.addedDomain.$save(success, error);
    };

    thisScope.deleteDomain = function (domain) {
      domain.$delete(function (resp, headers) {
        alertService.add('success', gettextCatalog.getString('Domain deleted successfully'));
        thisScope.pageChanged();
      });
    };

    thisScope.getOrganizations = function (search) {
      List.query({'name': search, 'type': 'organization'}, function (orgs) {
        thisScope.organizations = orgs;
      });
    };

  }
})();
