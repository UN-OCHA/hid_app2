(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('TutorialController', TutorialController);

  TutorialController.$inject = ['$location', '$scope', 'User', 'gettextCatalog'];

  function TutorialController($location, $scope, User, gettextCatalog) {
    var thisScope = $scope;

    thisScope.user = new User(thisScope.currentUser);
    thisScope.activeSlide = 0;
    thisScope.numSlides = thisScope.isApp ? 3 : 4;

    function updateUser () {

      if (thisScope.user.appMetadata && thisScope.user.appMetadata.hid && thisScope.user.appMetadata.hid.viewedTutorial) {
        return;
      }

      thisScope.user.setAppMetaData({viewedTutorial: true});
      thisScope.user.$update(function (user) {
        thisScope.setCurrentUser(user);
      });
    }
    updateUser();

    thisScope.swipeLeft = function () {
      if (thisScope.activeSlide +1 < thisScope.numSlides) {
        thisScope.activeSlide = thisScope.activeSlide + 1;
      }
    };

    thisScope.swipeRight = function () {
      if (thisScope.activeSlide > 0) {
        thisScope.activeSlide = thisScope.activeSlide - 1;
      }
    };

    thisScope.finishTutorial = function () {
      $location.path('/landing');
    };

  }
})();
