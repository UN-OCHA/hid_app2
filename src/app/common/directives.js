var commonDirectives = angular.module('commonDirectives', []);

/* Search through hrinfo API */
commonDirectives.directive("hrinfoTypeahead", function ($compile, $http, config) {
  function linker(scope, element, attrs, wrappingController){
    var html = '<input type="text" ng-model="selectedItem" bs-typeahead bs-options="i as i.name for i in getItem($viewValue)" placeholder="Start typing" class="form-control"></input>';
    element.html(html);
    $compile(element.contents())(scope);
    scope.type = attrs.type;
    /*scope.$watch('selectedLocation', function(item)
    {
       console.log(wrappingController);
       wrappingController.selectLocation(item.id);
    });*/
  }

  function hrinfoTypeaheadCtrl($scope){
    $scope.getItem = function (val) {
      return $http
        .get(config.hrinfoUrl + $scope.type + '?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
        .then(function (res) {
          var out = [];
          angular.forEach(res.data.data, function (value, key) {
            this.push({
              id: key,
              name: value
            });
          }, out);
          return out;
        }
      );
    }

    $scope.selectedItem = '';
  }

  return {
    restrict : 'E',
    scope: {
      selectedItem: '&'
    },
    require:"^ngController",
    link: linker,
    controller: hrinfoTypeaheadCtrl
  };
});

/* Back button */
commonDirectives.directive('backButton', ['$window', function($window) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.bind('click', function () {
        $window.history.back();
      });
    }
  };
}]);

