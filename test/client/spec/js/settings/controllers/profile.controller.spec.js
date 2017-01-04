(function () {
    'use strict';

    describe('ProfileCtrl', function () {
        var injector,
            scope,
            controller;

        beforeEach(angular.mock.module('bcbsa-shell'));

        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            controller = $controller('ProfileCtrl as vm', {$scope: scope});
        }));

        it('should initialize the controller accordingly', function () {
            expect(controller.header).toEqual('Profile Settings');
        });
    });
})();