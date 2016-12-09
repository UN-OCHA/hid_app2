(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('hrinfoTypeahead', hrinfoTypeahead);

  hrinfoTypeahead.$inject = ['$compile', '$http', 'config'];

  function hrinfoTypeahead($compile, $http, config) {
      var directive = {
        restrict : 'E',
        scope: {
          selectedItem: '&'
        },
        require:"^ngController",
        link: linker,
        controller: hrinfoTypeaheadCtrl
      };
      return directive;

      function linker(scope, element, attrs){
        var html = '<input type="text" ng-model="selectedItem" bs-typeahead bs-options="i as i.name for i in getItem($viewValue)" placeholder="Start typing" class="form-control"></input>';
        element.html(html);
        $compile(element.contents())(scope);
        scope.type = attrs.type;
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
        };

        $scope.selectedItem = '';
      }
  }

})();
