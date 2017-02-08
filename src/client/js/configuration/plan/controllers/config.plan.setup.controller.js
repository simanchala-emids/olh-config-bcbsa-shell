(function () {
    'use strict';

    module.exports = angular.module('bcsba-shell.configuration.plan.controllers.planSetupController', [])
        .controller('PlanSetupCtrl', PlanSetupCtrl);

    PlanSetupCtrl.$inject = ['ConfigService', 'FileUploader'];
    function PlanSetupCtrl(ConfigService, FileUploader) {
        var vm = this;

        vm.rootConfig = ConfigService.getCachedConfig();

        vm.planSetup = {};

        vm.planSetup = angular.extend(vm.planSetup, vm.rootConfig.planSetup);

        vm.languages = ConfigService.getConfigurableLanguages();

        vm.uploadLogo = function (file, model) {
            if (!file) {
                return;
            }

            vm.uploadingLogo = true;

            FileUploader
                .uploadFile(file)
                .then(function (data) {
                    vm.uploadingLogo = false;
                    vm.base64Logo = 'data:' + data.file.headers['content-type'] + ';base64,' + data.file.base64String;
                    model.src = vm.base64Logo;
                }, function (error) {
                    vm.uploadingLogo = false;
                    console.log(error);
                }, function (progress) {
                    vm.uploadLogoProgress = progress;
                });
        };

        vm.uploadBackgroundImage = function (file) {
            if (!file) {
                return;
            }

            vm.uploadingBackgroundImage = true;

            FileUploader
                .uploadFile(file)
                .then(function (data) {
                    vm.uploadingBackgroundImage = false;
                    vm.backgroundImage = data.file;
                    vm.base64BackgroundImage = 'data:' + data.file.headers['content-type'] + ';base64,' + data.file.base64String;
                }, function (error) {
                    vm.uploadingBackgroundImage = false;
                    console.log(error);
                }, function (progress) {
                    vm.uploadBackgroundImageProgress = progress;
                });
        };
    }
})();