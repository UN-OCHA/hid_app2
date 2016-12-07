userServices = angular.module('userServices', ['ngCachedResource']);

userServices.factory('User', ['$cachedResource', '$http', '$location', 'config',
  function($cachedResource, $http, $location, config){

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

    // Notify user
    User.prototype.notify = function (message, success, error) {
      $http.post(config.apiUrl + 'user/' + this._id + '/notification', {message: message}).then(success, error);
    };


    return User;

  }
]);

userServices.factory('UserCheckIn', ['$cachedResource', 'config',
  function ($cachedResource, config) {
    return $cachedResource('userCheckins', config.apiUrl + 'user/:userId/:listType/:checkInId');
  }
]);

userServices.factory('userService', ['$rootScope', '$log', 'User',
  function ($rootScope, $log, User) {
    var userService = {};

    userService.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('users-updated-event', callback);
      scope.$on('$destroy', handler);
      $rootScope.$broadcast('user-service-ready');
    };

    userService.notify = function (request) {
      $rootScope.$emit('users-updated-event', request);
    };

    userService.getUsers = function (params, notify) {
      return User.query(params).$promise.then(function (response) {
        return response;
      }, function (error) {
        $log.error(error);
      });
    }


    return userService;
  }
]);
