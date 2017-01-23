(function () {
  'use strict';

  angular
    .module('app.start')
    .controller('StartCtrl', StartCtrl);

  StartCtrl.$inject = ['$location', '$scope', 'User'];

  function StartCtrl($location, $scope, User) {

  	$scope.user = User.get({userId: $scope.currentUser._id}, function (user) {
      $scope.$broadcast('userLoaded');
    });

    //move to own ctrl?
    $scope.activeSlide = 0;
    $scope.slides = [
      {
        id: 1,
        image: '/assets/img/tutorial-slide-1.jpg',
        heading: 'Find others',
        text: 'No matter whether you are looking for an individual, a contact list or a specific role – all contacts are at your finger tip.',
      },
      {
        id: 2,
        image: '/assets/img/tutorial-slide-1.jpg',
        heading: 'Check in and out',
        text: 'You’re deploying to a country, disaster or joining a sector? Check into the contact list when you arrive and out when you leave.'
      },
      {
        id: 3,
        image: '/assets/img/tutorial-slide-1.jpg',
        heading: 'Manage your own lists',
        text: 'Create your own contact lists and share them with others. Let others check into your lists or decide yourself whom to add.'
      }
    ];

    $scope.swipeLeft = function () {
      if ($scope.activeSlide +1 < $scope.slides.length) {
        $scope.activeSlide = $scope.activeSlide + 1;
      }
    }

    $scope.swipeRight = function () {
      if ($scope.activeSlide > 0) {
        $scope.activeSlide = $scope.activeSlide - 1;
      }
    }

    $scope.finishTutorial = function () {
      $location.path('/landing');
    }
    
  }
})();
