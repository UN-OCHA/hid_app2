(function() {
  'use strict';

  angular
    .module('app.sidebar')
    .directive('sidebar', sidebar);

  sidebar.$inject = ['$rootScope'];

  function sidebar($rootScope) {
    var breakpoint = 576;
    var headerHeight = 102;

    function shouldScroll (scroll) {
      return scroll && window.innerWidth < breakpoint;
    }

    function setHeight (element) {
      var windowHeight = window.innerHeight;
      element.css('height', windowHeight + 'px'); 
    }

    function setScrollPosition (element) {
      var scrollPosition = document.body.scrollTop;
      var marginTop = scrollPosition - headerHeight;

      if (scrollPosition > headerHeight) {
        element.css('top', marginTop + 'px');
        return;
      }
      reset(element);  
    }

    function reset (element) {
      document.removeEventListener('scroll', setScrollPosition);
      element.css({
        top: '',
        height: ''
      });
    }

    function initScroll (element) {
      setHeight(element);
      setScrollPosition(element);
    }
 
    var directive = {
      restrict: 'A',
      link: function (scope, element) {

        $rootScope.$on('sidebar-toggled', function (event, data) {
          if (shouldScroll(data.scroll)) {
            initScroll(element);
            return;
          }
          reset(element);
        });
      }
      
    };

    return directive;
  }
})();
