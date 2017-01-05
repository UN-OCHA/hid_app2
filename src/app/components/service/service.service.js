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

    Service.prototype.ownersIndex = function (user) {
      var index = -1;
      if (this.owners && this.owners.length) {
        for (var i = 0; i < this.owners.length; i++) {
          if (this.owners[i].id === user.id) {
            index = i;
          }
        }
      }
      return index;
    };

    Service.prototype.isOwner = function (user) {
      return (this.owner && this.owner.id === user.id) || (this.ownersIndex(user) !== -1);
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
