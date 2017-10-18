(function () {
  'use strict';

  angular
  .module('app.user')
  .factory('User', User);

  User.$inject = ['$resource', '$http', '$location', '$window', 'config'];

  function User($resource, $http, $location, $window, config) {

   var User = $resource(config.apiUrl + 'user/:userId', {userId: '@_id'},
   {
    'save': {
      method: 'POST'
    },
    'remove': {
      method: 'DELETE'
    },
    'delete': {
      method: 'DELETE'
    },
    'update': {
      method: 'PUT',
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
    User.prototype.setPrimaryEmail = function (email, success, error, token) {
      console.log('token',token)
      var req = {
        method: 'PUT',
        url: config.apiUrl + 'user/' + this._id + '/email',
        data: { email: email },
        headers: {
          'X-HID-TOTP': token
        }
      }
      $http(req).then(success, error);
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
      var par = angular.copy(params);
      delete par.limit;
      delete par.offset;
      par.token = $window.localStorage.getItem('jwtToken');
      var urlp = Object.keys(par).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(par[k]);
      }).join('&');
      return config.apiUrl + 'user.csv?' + urlp;
    };

    // Export to TXT
    User.exportTXT = function (params, success, error) {
      var par = angular.copy(params);
      delete par.limit;
      delete par.offset;
      var urlp = Object.keys(par).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(par[k]);
      }).join('&');
      $http.get(config.apiUrl + 'user.txt?' + urlp).then(success, error);
    };

    // Export to pdf
    User.getPDFUrl = function (params, format) {
      var par = angular.copy(params);
      delete par.limit;
      delete par.offset;
      par.token = $window.localStorage.getItem('jwtToken');

      //remove any undefined params
      angular.forEach(par, function (value, key) {
        if (value === undefined) {
          delete par[key];
        }
      });

      var urlp = Object.keys(par).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(par[k]);
      }).join('&');
      var pdfViewer = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=';
      var url = config.apiUrl + 'user.pdf?';
      if (format) {
        url += 'format=' + format + '&';
      }

      return pdfViewer + encodeURIComponent(url + urlp);
    };

    User.prototype.setAppMetaData = function (param) {
      var hidMeta = {
        hid: param
      };

      if (!this.appMetadata) {
        this.appMetadata = {
          hid: param
        };
        return this;
      }

      if (this.appMetadata && !this.appMetadata.hid) {
        angular.extend(this.appMetadata, hidMeta);
        return this;
      }
      angular.extend(this.appMetadata.hid, hidMeta.hid);
      return this;
    };

    User.prototype.requestConnection = function (userId, success, error) {
      $http.post(config.apiUrl + 'user/' + userId + '/connections', {}).then(success, error);
    };

    User.prototype.approveConnection = function (userId, connectionId, success, error) {
      $http.put(config.apiUrl + 'user/' + userId + '/connections/' + connectionId, {}).then(success, error);
    };

    User.prototype.deleteConnection = function (userId, connectionId, success, error) {
      $http.delete(config.apiUrl + 'user/' + userId + '/connections/' + connectionId, {}).then(success, error);
    };

    return User;

  }

})();
