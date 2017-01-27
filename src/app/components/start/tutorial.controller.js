(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('TutorialCtrl', TutorialCtrl);

  TutorialCtrl.$inject = ['$location', '$scope', 'User'];

  function TutorialCtrl($location, $scope, User) {
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
        heading: 'Find others',
        text: 'No matter whether you are looking for an individual, a contact list or a specific role – all contacts are at your finger tip.',
      },
      {
        id: 2,
        image: '/img/tutorial/slide-checkins.jpg',
        heading: 'Check in and out',
        text: 'You’re deploying to a country, disaster or joining a sector? Check into the contact list when you arrive and out when you leave.'
      },
      {
        id: 3,
        image: '/img/tutorial/slide-managing-lists.jpg',
        heading: 'Manage your own lists',
        text: 'Create your own contact lists and share them with others. Let others check into your lists or decide yourself whom to add.'
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
