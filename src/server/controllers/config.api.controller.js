(function () {
    'use strict';
    var mongodb = require('mongodb'),
        mongodbClient = mongodb.MongoClient,
        ObjectID = mongodb.ObjectID,
        dbConfig = require('../config/dbConfig')();

    module.exports = ConfigApiController;

    function ConfigApiController() {
        var connectionString = dbConfig.dbConnectionString();

        return {
            listGroups: listGroups,
            groupConfigById: groupConfigById,
            groupConfigByName: groupConfigByName,
            newGroupConfig: newGroupConfig,
            saveGroupConfig: saveGroupConfig,
            deleteGroupConfig: deleteGroupConfig
        };

        function listGroups(request, response, next) {
            var query = {},
                projection = {groupId: 1, name: 1, description: 1};

            mongodbClient.connect(connectionString, function (error, db) {
                if (error) {
                    next(error);
                }

                var cursor = db.collection('groups').find(query, projection);

                cursor.toArray(function (error, groups) {
                    response.json({groups: groups});
                });
            });
        }

        function groupConfigById(request, response, next) {
            var groupId = request.params.groupId,
                query = groupId === 'Root' ? {name: 'Root'} : {_id: new ObjectID(groupId)};

            getGroupConfig(query, response, next);
        }

        function groupConfigByName(request, response, next) {
            var groupName = request.params.groupName,
                query = {name: groupName};

            getGroupConfig(query, response, next);
        }

        function getGroupConfig(query, response, next) {
            mongodbClient.connect(connectionString, function (error, db) {
                db.collection('groups').findOne(query, function (error, groupConfig) {
                    if (error) {
                        next(error);
                    }

                    if (!groupConfig) {
                        return next(null, false, {message: 'Group Configuration Not Found!'});
                    }

                    response.json({groupConfig: groupConfig});
                });
            });
        }

        function newGroupConfig(request, response, next) {
            var group = request.body.config,
                groupNameRegex = new RegExp(['^', group.name, '$'].join(''), 'i'),
                checkExistingGroup = {name: groupNameRegex},
                userName = request.body.userName;

            group.config = {};
            group.createdAt = new Date();
            group.updatedAt = new Date();
            group.updatedBy = userName;

            mongodbClient.connect(connectionString, function (error, db) {
                if (error) {
                    next(error);
                }

                db.collection('groups').findOne(checkExistingGroup, function (error, existingGroup) {
                    if (existingGroup) {
                        return response.status(409).json({
                            error: {
                                message: 'Another Group with the same name already exists, please choose a different name!!'
                            }
                        });
                    } else {
                        db.collection('groups').find({}, {_id: 0, groupId: 1}).sort({groupId: -1}).limit(1).toArray(function (error, groupSeqResult) {
                            group.groupId = groupSeqResult[0].groupId + 1;

                            db.collection('groups').insert(group, function (error, insertResult) {
                                var group = insertResult.ops[0],
                                    newUserGroup = {
                                        _id: group._id.toString(),
                                        groupId: group.groupId,
                                        name: group.name,
                                        description: group.description
                                    },
                                    userQuery = {'auth.userName': userName},
                                    addUserGroup = {$addToSet: {groups: newUserGroup}};

                                db.collection('users').updateOne(userQuery, addUserGroup, function (error, updateResult) {
                                    if (error) {
                                        next(error);
                                    }

                                    if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 1) {
                                        response.json({group: group});
                                    }
                                });
                            });
                        });
                    }
                });
            });
        }

        function saveGroupConfig(request, response, next) {
            var config = request.body.config,
                userName = request.body.userName,
                query = {'_id': new ObjectID(request.params.groupId)},
                updateObj = {$set: {config: config, updatedAt: new Date(), updatedBy: userName}};

            mongodbClient.connect(connectionString, function (error, db) {
                db.collection('groups').updateOne(query, updateObj, function (error, result) {
                    if (error) {
                        next(error);
                    }

                    if (result.matchedCount === 1 && result.modifiedCount === 1) {
                        db.collection('groups').findOne(query, function (error, group) {
                            response.json({group: group});
                        });
                    }
                });
            });
        }

        function deleteGroupConfig(request, response, next) {
            var groupId = request.params.groupId,
                query = {_id: new ObjectID(groupId)};

            mongodbClient.connect(connectionString, function (error, db) {
                db.collection('groups').deleteOne(query, function (error, result) {
                    if (error) {
                        next(error);
                    }

                    if (result.deletedCount === 1) {
                        db.collection('users').updateMany(
                            {'groups._id': groupId},
                            {$pull: {groups: {_id: groupId}}},
                            function (error, result) {
                                if (error) {
                                    next(error);
                                }

                                if (result.matchedCount >= 1 && result.modifiedCount >= 1) {
                                    response.json({success: {deleted: 1}});
                                }
                            });
                    }
                });
            });
        }
    }
})();
