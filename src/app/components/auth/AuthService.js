(function () {
  'use strict';

  angular
    .module('app.auth')
    .factory('AuthService', AuthService);

  AuthService.$inject = ['$exceptionHandler', '$http', '$localForage', '$q', '$window', '$rootScope', '$timeout', '$interval', '$location', 'config', 'UserListsService', 'notificationsService'];

  function AuthService ($exceptionHandler, $http, $localForage, $q, $window, $rootScope, $timeout, $interval, $location, config, UserListsService, notificationsService) {
    var checkingNotifications;
    var cachingLists;
    var swRegistration;
    var notificationsPermitted = true;

    function storeUser (response) {
      try {
        $window.localStorage.setItem('jwtToken', response.data.token);
        $window.localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      } catch (e) {
        $window.localStorage.clear();
        storeUser(response);
      }
    }

    function serviceWorkerNotification (item, swReg) {
       swReg.showNotification('', {
        body: item.text,
        icon: $location.protocol() + '://' + $location.host() + '/img/notification-icon.png',
        dir: 'auto'
      });
    }

    function showNotification (item) {
      if (item && !item.notified) {
        var notification;
        var link =item.link;

        item.notified = true;
        item.read = false;
        notificationsService.update(item);

        try {
          notification = new Notification('',{
            body: item.text,
            icon: $location.protocol() + '://' + $location.host() + '/img/notification-icon.png',
            dir: 'auto'
          });
          notification.onclick = function () {
            item.notified = true;
            item.read = true;
            notificationsService.update(item);
            notification.close();
            $location.path(link);
          };

          $timeout(notification.close.bind(notification), 5000);

        } catch (e) {
          if ('serviceWorker' in navigator && 'PushManager' in window) {

            if (!swRegistration) {
              navigator.serviceWorker.register('sw.js')
                .then(function(swReg) {
                 swRegistration = swReg;
                 navigator.serviceWorker.ready.then(function () {
                  serviceWorkerNotification(item, swRegistration);
                 });
              }).catch(function(error) {
                $exceptionHandler(error, 'Cannot register service worker');
              });
              return;
            }
            serviceWorkerNotification(item, swRegistration);
          }
        }
      }
    }

    function showNotifications (index, items) {
      $timeout(function (index, items) {
        showNotification(items[index]);
        if (items.length > index + 1) {
          showNotifications(index + 1, items);
        }
      }, 3000, index, items);
    }

    function getNotificationsPermission () {
      if (!("Notification" in window) || Notification.permission === 'denied') {
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
          return true;
        }
        return false;
      });
    }

    function getUnreadNotifications () {
      notificationsService.getUnread().then(function (items) {
        if (items && items.length && notificationsPermitted) {
          showNotification(items[0]); //show first notification
          showNotifications(1, items); // show rest with delay between
        }
      });
    }

    function notificationsHelper () {
      notificationsPermitted = getNotificationsPermission();
      getUnreadNotifications();

      checkingNotifications = $interval(function () {
        if ($rootScope.isOnline) {
          getUnreadNotifications();
        }
      }, 60000);
    }

    function cachingHelper () {
      var user = JSON.parse($window.localStorage.getItem('currentUser'));

      // Check if has been cached in last hour, cache if not
      var lfcacheInfo = $localForage.instance('cacheInfo');
      lfcacheInfo.getItem('cachedAt').then(function(cacheDate) {
        if (cacheDate && moment(cacheDate).add(1, 'hour').isAfter()) {
          return;
        }
        if ($rootScope.isOnline) {
          UserListsService.cacheListsForUser(user);
        }

      }).catch(function () {
        if ($rootScope.isOnline) {
          UserListsService.cacheListsForUser(user);
        }
      });

      cachingLists = $interval(function () {
        if ($rootScope.canCache && $rootScope.isOnline) {
          UserListsService.cacheListsForUser(user);
        }
      }, 3600000);
    }

    function refreshToken (success, failure) {
      var newExpiry = moment().add(1, 'days').unix();
      $http.post(config.apiUrl + 'jsonwebtoken', {exp: newExpiry}).then(function (response) {
        if (response.data && response.data.token) {
          storeUser(response);
          success();
        }
      }, function (error) {
        $exceptionHandler(error, 'Refresh token');
        failure();
      });
    }

    function checkAuthentication (token) {
      var deferred = $q.defer();
      var parsedToken = jwt.parseToken(token);
      var expiry = moment.unix(parsedToken.exp);
      var current = moment();
      var refreshPoint = moment(current).add(2, 'hours');

      if (expiry.isBefore(current)) {
        deferred.reject();
        return deferred.promise;
      }

      if (expiry.isAfter(refreshPoint)) {
        if (!checkingNotifications) {
          notificationsHelper();
        }
        if (!cachingLists) {
          cachingHelper();
        }

        deferred.resolve();
        return deferred.promise;
      }

      refreshToken(function () {
        deferred.resolve();
      }, function (){
        deferred.reject();
      });

      return deferred.promise;
    }

    var jwt = {
      login: function(email, password, tfaCode) {
        var expiry = moment().add(1, 'days').unix();

        var req = {
          method: 'POST',
          url: config.apiUrl + 'jsonwebtoken',
          data: { 'email': email, 'password': password, exp: expiry }
        }

        if (tfaCode) {
          req.headers = {
            'X-HID-TOTP': tfaCode
          }
        }

        var promise = $http(req).then(function (response) {
          if (response.data && response.data.token) {
            storeUser(response);
          }
        }, function (error) {
          return error;
        });
        return promise;
      },

      logout: function() {
        $window.localStorage.removeItem('jwtToken');
        $window.localStorage.removeItem('currentUser');
        $interval.cancel(cachingLists);
        $interval.cancel(checkingNotifications);
        if (swRegistration) {
          swRegistration.unregister();
        }
      },

      isAuthenticated: function(callback) {
        var token = $window.localStorage.getItem('jwtToken');
        if (!token) {
          jwt.logout();
          callback(false);
          return;
        }

        checkAuthentication(token).then(function() {
          callback(true);
        }, function () {
          jwt.logout();
          callback(false);
        });
      },

      parseToken: function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
      },

      generateAPIToken: function (success) {
        return $http.post(config.apiUrl + 'jsonwebtoken').then(function (response) {
          success(response.data);
        }, function (error) {
           $exceptionHandler(error, 'generateAPIToken');
        });
      },

      getUserTokens: function (success) {
        return $http.get(config.apiUrl + 'jsonwebtoken').then(function (response) {
          success(response.data);
        }, function (error) {
          $exceptionHandler(error, 'getUserTokens');
        });
      },

      deleteToken: function (token, success) {
        return $http.delete(config.apiUrl + 'jsonwebtoken', {data: {token: token, blacklist: true}, headers: {'Content-Type': 'application/json'}}).then(function (response) {
          success(response.data);
        }, function (error) {
          $exceptionHandler(error, 'deleteToken');
        });
      }
    };
    return jwt;
  }
})();
