appControllers.controller('UserFilters', ['$scope', 'userService', 'hrinfoService', 'List',
  function ($scope, userService, hrinfoService, List) {

    $scope.filters = {};
    $scope.operations = [];
    $scope.bundles = [];
    $scope.disasters = [];
    $scope.roles = [];
    $scope.organizations = [];
    $scope.countries = [];

    $scope.filter = function() {
      console.log('start')
      userService.setFilters($scope.filters);
      $scope.currentPage = 1;
      $scope.pageChanged();
    };

    $scope.resetFilters = function () {
      userService.setFilters({});
      $scope.filters = [];
      $scope.currentPage = 1;
      $scope.pageChanged();
    }

    function getFilterLists () {
      $scope.operations = List.query({type: 'operation'});

      $scope.getBundles = function(search) {
        $scope.bundles = List.query({type: 'bundle', name: search});
      };

      $scope.getDisasters = function(search) {
        $scope.disasters = List.query({type: 'disaster', name: search});
      };

      hrinfoService.getRoles().then(function (data) {
        $scope.roles = data;
      });

      $scope.getOrganizations = function(search) {
        $scope.organizations = List.query({type: 'organization', name: search});
      };

      hrinfoService.getCountries().then(function (data) {
        $scope.countries = data;
      });

    }


    getFilterLists();

}]);

//TO DO
// loader?
// show what filtered by
