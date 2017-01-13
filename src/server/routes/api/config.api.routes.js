(function () {
    'use strict';

    var configApiRouter = require('express').Router(),
        configApiController = require('../../controllers/config.api.controller.js')(null, {});

    module.exports = ConfigApiRoutes;

    function ConfigApiRoutes() {
        configApiRouter
            .route('/:groupId')
            .get(configApiController.groupConfig);

        return configApiRouter;
    }
})();
