(function () {
  'use strict';

  angular
    .module('app.service')
    .factory('Service', Service);

  Service.$inject = ['$resource', '$http', 'config'];

  function Service ($resource, $http, config) {
    var Service = $resource(config.apiUrl + 'service/:serviceId', {serviceId: '@_id'},
    {
      'update': {
        method: 'PUT'
      }
    });

    Service.prototype.subscribe = function (user) {
      return $http.post(config.apiUrl + 'user/' + user._id + '/subscriptions', {service: this._id});
    };

    Service.prototype.unsubscribe = function (user) {
      return $http.delete(config.apiUrl + 'user/' + user._id + '/subscriptions/' + this._id);
    };

    // Get mailchimp lists
    Service.getMailchimpLists = function (apiKey) {
      return $http.get(config.apiUrl + 'service/mailchimp/lists?apiKey=' + apiKey);
    };

    // Get google groups
    Service.getGoogleGroups = function (domain) {
      return $http.get(config.apiUrl + 'service/google/groups?domain=' + domain);
    };

    return Service;
  }
})();
