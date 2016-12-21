(function () {
  'use strict';

  angular
  .module('app.user')
  .factory('User', User);

  User.$inject = ['$cachedResource', '$http', '$location', '$window', 'config'];

  function User($cachedResource, $http, $location, $window, config) {

   var User = $cachedResource('users', config.apiUrl + 'user/:userId', {userId: '@_id'},
   {
    'save': {
      method: 'POST',
      cache: false
    },
    'remove': {
      method: 'DELETE',
      cache: false
    },
    'delete': {
      method: 'DELETE',
      cache: false
    },
    'update': {
      method: 'PUT',
        // TODO: find a way to cache these requests, and fix https://github.com/goodeggs/angular-cached-resource/issues/72
        cache: false
      }
    });

    // Return current user checkin
    User.prototype.currentCheckin = function (list) {
      var out = false;
      angular.forEach(this[list.type + 's'], function (val, key) {
        if (angular.equals(list._id, val.list)) {
          out = val;
        }
      });
      return out;
    };

    // Send claim email
    User.prototype.claimEmail = function (success, error) {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      $http.put(config.apiUrl + 'user/' + this._id + '/orphan', {app_reset_url: app_reset_url}).then(success, error);
    };

    // Send password reset email
    User.passwordReset = function(email, success, error) {
      var app_reset_url = $location.protocol() + '://' + $location.host() + '/reset_password';
      $http.put(config.apiUrl + 'user/password', {email: email, app_reset_url: app_reset_url}).then(success, error);
    };

    // Reset user email
    User.resetPassword = function(hash, password, success, error) {
      $http.put(config.apiUrl + 'user/password', {hash: hash, password: password}).then(success, error);
    };

    // Validate user email
    User.validateEmail = function (hash, success, error) {
      $http.put(config.apiUrl + 'user/emails', { hash: hash }).then(success, error);
    };

    // Resend validation email
    User.prototype.resendValidationEmail = function (email, success, error) {
      var app_validation_url = $location.protocol() + '://' + $location.host() + '/verify';
      $http.put(config.apiUrl + 'user/emails/' + email, {app_validation_url: app_validation_url}).then(success, error);
    };

    // Add email for validation
    User.prototype.addEmail = function (data, success, error) {
      data.app_validation_url = $location.protocol() + '://' + $location.host() + '/verify';
      $http.post(config.apiUrl + 'user/' + this._id + '/emails', data).then(success, error);
    };

    // Set primary email
    User.prototype.setPrimaryEmail = function (email, success, error) {
      $http.put(config.apiUrl + 'user/' + this._id + '/email', { email: email }).then(success, error);
    };

    // Delete email
    User.prototype.dropEmail = function (email, success, error) {
      $http.delete(config.apiUrl + 'user/' + this._id + '/emails/' + email).then(success, error);
    };

    // Add phone number
    User.prototype.addPhone = function (phone, success, error) {
      $http.post(config.apiUrl + 'user/' + this._id + '/phone_numbers', phone).then(success, error);
    };

    // Drop phone number
    User.prototype.dropPhone = function (id, success, error) {
      $http.delete(config.apiUrl + 'user/' + this._id + '/phone_numbers/' + id).then(success, error);
    };

    // Set primary phone number
    User.prototype.setPrimaryPhone = function (phone, success, error) {
      $http.put(config.apiUrl + 'user/' + this._id + '/phone_number', { phone: phone }).then(success, error);
    };

    // Set primary organization
    User.prototype.setPrimaryOrganization = function (org, success, error) {
      $http.put(config.apiUrl + 'user/' + this._id + '/organization', org).then(success, error);
    };

    // Notify user
    User.prototype.notify = function (message, success, error) {
      $http.post(config.apiUrl + 'user/' + this._id + '/notification', {message: message}).then(success, error);
    };

    // Export to csv
    User.getCSVUrl = function(params) {
      delete params.limit;
      delete params.offset;
      params.token = $window.localStorage.getItem('jwtToken');
      var urlp = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&');
      return config.apiUrl + 'user.csv?' + urlp;
    };


    return User;

  }

})();
