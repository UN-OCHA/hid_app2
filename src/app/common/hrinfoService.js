(function () {
  'use strict';

  angular
    .module('app.common')
    .factory('hrinfoService', hrinfoService);

  hrinfoService.$inject = ['$http', 'config'];

  function hrinfoService($http, config) {

    var countriesPromise, rolesPromise;
    return {
      getCountries: function() {
        if (!countriesPromise) {
          countriesPromise = $http.get('https://www.humanitarianresponse.info/hid/locations/countries').then(
            function (response) {
              var countries = [];
              for (var key in response.data) {
                countries.push({
                  'id': key,
                  'name': response.data[key]
                });
              }
              return countries;
            }
          );
        }
        return countriesPromise;
      },

      getRegions: function (ctry) {
        return $http.get('https://www.humanitarianresponse.info/hid/locations/' + ctry).then(
          function (response) {
            var regions = [];
            for (var key in response.data.regions) {
              regions.push({
                'id': key,
                'name': response.data.regions[key].name
              });
            }
            return regions;
          }
        );
      },

      getRoles: function () {
        if (!rolesPromise) {
          rolesPromise = $http.get(config.hrinfoUrl + '/functional_roles').then(function (resp) {
            return resp.data.data;
          });
        }
        return rolesPromise;
      }
    };

  }

})();
