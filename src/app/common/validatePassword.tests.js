(function() {
  'use strict';

  describe('directives', function() {
    var $scope, form;
    beforeEach(module('app.common'));

    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope;
      var element = angular.element(
        '<form name="form">' +
          '<input ng-model="model.password" name="password" validate-password />' +
        '</form>'
      );
      $scope.model = { password: null };
      $compile(element)($scope);
      $scope.$digest();
      form = $scope.form;
    }));

    describe('Validate Password', function() {

      it('should not validate the password if less than 8 characters', function () {
        form.password.$setViewValue('Qw3rty');
        expect(form.password.$valid).toBe(false);
      });

      it('should not validate the password it doesn\'t contain a number', function () {
        form.password.$setViewValue('Qwertyuiop');
        expect(form.password.$valid).toBe(false);
      });

      it('should not validate the password it doesn\'t contain an uppercase character', function () {
        form.password.$setViewValue('qw3rtyuiop');
        expect(form.password.$valid).toBe(false);
      });

      it('should not validate the password it doesn\'t contain a lowercase character', function () {
        form.password.$setViewValue('QW3RTYUIOP');
        expect(form.password.$valid).toBe(false);
      });

      it('should validate the password if it meets all the requirements', function () {
        form.password.$setViewValue('Qw3rtyuiop');
        expect(form.password.$valid).toBe(true);
      });

    });
  });

})();
