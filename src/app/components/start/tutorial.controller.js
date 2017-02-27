(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('TutorialCtrl', TutorialCtrl);

  TutorialCtrl.$inject = ['$location', '$scope', 'User', 'gettextCatalog'];

  function TutorialCtrl($location, $scope, User, gettextCatalog) {
    $scope.user = new User($scope.currentUser);
    $scope.activeSlide = 0;
    
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
    
    $scope.slides = [
      {
        id: 1,
        image: '/img/tutorial/slide-find-contacts.jpg',
        heading: gettextCatalog.getString('Find others'),
        text: gettextCatalog.getString('No matter whether you are looking for an individual, a contact list or a specific role – all contacts are at your finger tips.')
      },
      {
        id: 2,
        image: '/img/tutorial/slide-checkins.jpg',
        heading: gettextCatalog.getString('Check in and out'),
        text: gettextCatalog.getString('Are you about to deploy to a new operation, join the response to a specific disaster or start working with a different sector or cluster? If so, check in to the relevant contact lists and don’t forget to check out when you leave the country.')
      },
      {
        id: 3,
        image: '/img/tutorial/slide-managing-lists.jpg',
        heading: gettextCatalog.getString('Manage your own lists'),
        text: gettextCatalog.getString('Create your own contact lists and share them with others. Let others check in to your lists or decide for yourself who can join.')
      }
    ];

    $scope.swipeLeft = function () {
      if ($scope.activeSlide +1 < $scope.slides.length) {
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
