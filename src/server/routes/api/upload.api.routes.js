(function () {
    'use strict';

    var uploadApiRouter = require('express').Router(),
        uploadApiController = require('../../controllers/upload.api.controller')(null, {});

    module.exports = UploadApiRoutes;

    function UploadApiRoutes() {
        uploadApiRouter
            .route('/file')
            .post(uploadApiController.uploadFile);

        return uploadApiRouter;
    }
})();
