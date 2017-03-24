(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('TutorialCtrl', TutorialCtrl);

  TutorialCtrl.$inject = ['$location', '$scope', 'User', 'gettextCatalog'];

  function TutorialCtrl($location, $scope, User, gettextCatalog) {
    $scope.user = new User($scope.currentUser);
    $scope.activeSlide = 0;
    $scope.numSlides = $scope.isApp ? 3 : 4;
    
    function updateUser () {

      if ($scope.user.appMetadata && $scope.user.appMetadata.hid && $scope.user.appMetadata.hid.viewedTutorial) {
        return;
      }

      $scope.user.setAppMetaData({viewedTutorial: true});
      $scope.user.$update(function (user) {
        $scope.setCurrentUser(user);
      });
    }
    updateUser();

    $scope.swipeLeft = function () {
      if ($scope.activeSlide +1 < $scope.numSlides) {
        $scope.activeSlide = $scope.activeSlide + 1;
      }
    };

    $scope.swipeRight = function () {
      if ($scope.activeSlide > 0) {
        $scope.activeSlide = $scope.activeSlide - 1;
      }
    };

    $scope.finishTutorial = function () {
      $location.path('/landing');
    };
    
  }
})();
