(function () {
  'use strict';

  angular
    .module('app.common')
    .directive('validatePassword', validatePassword);

    function validatePassword () {

      function containsNumbers(str) {
        return /\d/.test(str);
      }

      function containsLowerCase(str) {
        return (/[a-z]/.test(str));
      }

      function containsUpperCase(str) {
        return (/[A-Z]/.test(str));
      }

      return {
        restrict: 'A',
        require: 'ngModel',

        link: function(scope, element, attributes, ngModel) {
          ngModel.$validators.validatePassword = function(modelValue) {
            var minPasswordLength = 8;

            return modelValue && modelValue.length >= minPasswordLength
              && containsNumbers(modelValue)
              && containsUpperCase(modelValue)
              && containsLowerCase(modelValue);
          };
        }
      };
    }
})();
