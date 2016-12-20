(function () {
  'use strict';

  angular
    .module('app.auth')
    .factory('AuthService', AuthService);

  AuthService.$inject = ['$http', '$window', '$rootScope', '$interval', '$location', 'config', 'offlineService', 'hidNotification'];

  function AuthService ($http, $window, $rootScope, $interval, $location, config, offlineService, hidNotification) {
    var jwt = {
      _notificationsHelper: function (permission, userId) {
        if (permission === 'granted') {
          $rootScope.notificationPromise = $interval(function () {
            var display = function (index, items) {
              setTimeout(function (index, items) {
                if (items.length) {
                  var notification = new Notification('',{
                    body: items[index].text,
                    icon: $location.protocol() + '://' + $location.host() + '/img/logo.png',
                    dir: 'auto'
                  });
                  items[index].read = true;
                  items[index].$save();
                }
                if (items.length > index + 1) {
                  display(index + 1, items);
                }
              }, 3000, index, items);
            };
            hidNotification.query({read: false}, function (items) {
              display(0, items);
            });
          }, 60000);
        }
      },

      login: function(email, password) {
        var that = this;
        var promise = $http.post(config.apiUrl + 'jsonwebtoken', { 'email': email, 'password': password }).then(function (response) {
          if (response.data && response.data.token) {
            $window.localStorage.setItem('jwtToken', response.data.token);
            $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            offlineService.cacheListsForUser(response.data.user);
            // Cache lists every 10 mins
            $rootScope.offlinePromise = $interval(function () {
              offlineService.cacheListsForUser(response.data.user);
            }, 600000);
            Notification.requestPermission(function (permission) {
              that._notificationsHelper(permission, response.data.user._id);
            });
          }
        });
        return promise;
      },

      logout: function() {
        $window.localStorage.removeItem('jwtToken');
        $window.localStorage.removeItem('currentUser');
        $interval.cancel($rootScope.offlinePromise);
        $interval.cancel($rootScope.notificationPromise);
      },

      getToken: function() {
        return $window.localStorage.getItem('jwtToken');
      },

      isAuthenticated: function() {
        var token = jwt.getToken();
        if (token) {
          var parsed = this.parseToken(token);
          var current = Date.now() / 1000;
          current = parseInt(current);
          if (parsed.exp <= current) {
            return false;
          }
          else {
            var that = this;
            if (!$rootScope.notificationPromise) {
              $rootScope.notificationPromise = true;
              Notification.requestPermission(function (permission) {
                that._notificationsHelper(permission, parsed.id);
              });
            }
            if (!$rootScope.offlinePromise) {
              $rootScope.offlinePromise = true;
              var user = JSON.parse($window.localStorage.getItem('currentUser'));
              $rootScope.offlinePromise = $interval(function () {
                offlineService.cacheListsForUser(user);
              }, 600000);
            }
            return true;
          }
        }
        else {
          return false;
        }
      },

      parseToken: function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
      },
    };
    return jwt;
  }
})();
