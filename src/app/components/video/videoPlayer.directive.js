/**
 * Video Player
 * Usage: <video-player default="YOUTUBE-ID" text="Actions"></video-player>
 * default is the YouTube ID of the video.
 * For different language versions, use the language code:
 * e.g. <video-player default="YOUTUBE-ID" en="YOUTUBE-ID" fr="YOUTUBE-ID-FR" text="Actions"></video-player>
 *
 * Videos are only loaded on large screens.
 */

(function() {
  'use strict';

  angular
    .module('app.common')
    .directive('videoPlayer', videoPlayer);

  videoPlayer.$inject = ['$sce'];

  function videoPlayer($sce) {

  	function template () {
  		var breakpoint = 1025;
  		if (window.innerWidth < breakpoint) {
  			return '<div></div>';
  		}
  		return '<div class="video-container"><iframe  width="560" height="315" src="{{url}}" frameborder="0" allowfullscreen></iframe></div>';
  	}

    var directive = {
      restrict: 'E',
      replace: 'true',
      scope: {
      	default: '@',
      	ar: '@',
      	en: '@',
      	fr: '@',
      	es: '@'
      },
      template: template,
      link: function (scope) {

      	var lang= '';
      	if (navigator && navigator.language) {
      		lang = navigator.language;
      	}
      	var videoId = scope[lang] ? scope[lang] : scope.default;
      	scope.url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId + '?rel=0');
      }
    };

    return directive;
  }
})();
