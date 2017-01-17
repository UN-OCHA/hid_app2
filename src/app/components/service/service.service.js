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

    Service.prototype.isManager = function (user) {
      var isManager = false;
      angular.forEach(this.managers, function (manager) {
        if (user._id === manager._id) {
          isManager = true;
          return;
        }
      });
      return isManager;
    };

    // Check if a user is subscribed to this service
    Service.prototype.isSubscribed = function (user) {
      var index = -1;
      for (var i = 0; i < user.subscriptions.length; i++) {
        if (user.subscriptions[i]._id.toString() === this._id.toString()) {
          index = i;
        }
      }
      return index !== -1;
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
