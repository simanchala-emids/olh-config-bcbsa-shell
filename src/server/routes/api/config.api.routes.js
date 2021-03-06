(function () {
    'use strict';

    var configApiRouter = require('express').Router(),
        configApiController = require('../../controllers/config.api.controller.js')(null, {});

    module.exports = ConfigApiRoutes;

    function ConfigApiRoutes() {
        configApiRouter
            .route('/list')
            .get(configApiController.listGroups);

        configApiRouter
            .route('/:groupId')
            .get(configApiController.groupConfigById);

        configApiRouter
            .route('/name/:groupName')
            .get(configApiController.groupConfigByName);

        configApiRouter
            .route('/')
            .post(configApiController.newGroupConfig);

        configApiRouter
            .route('/:groupId')
            .post(configApiController.saveGroupConfig);

        configApiRouter
            .route('/:groupId')
            .delete(configApiController.deleteGroupConfig);

        return configApiRouter;
    }
})();
