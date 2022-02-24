const userEntity = require("../entities/userEntity");
const postEntity = require("../entities/postEntity");
const folderEntity = require("../entities/folderEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "merge users use case error: ";

let mergeUsersFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({toUser, fromUser}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Merged users";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID: toUser.getID(),
            description: userLogDescription,
            additional: {
                mergedUser: fromUser.getID()
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const getUserEntity = async ({filter, userCollectionData}) => {
        const userData = await database.findOne({
            collectionData: userCollectionData,
            filter
        });

        if (validators.isNull(userData)) {
            return null;
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        return buildUser(userData);
    };

    const mergeFolderContent = async ({fromUserEntity, toUserEntity}) => {
        await mergeFolderFolders({fromUserEntity, toUserEntity});
        await mergeFolderPosts({fromUserEntity, toUserEntity});
    };

    const mergeFolderFolders = async ({fromUserEntity, toUserEntity}) => {
        const folderCollectionData = folderEntity.getCollectionData();
        const mergeFoldersData = await database.findAll({
            collectionData: folderCollectionData,
            filter: {
                userID: fromUserEntity.getID(),
                isDeleted: false
            },
            project: {
                ID: 1
            }
        });

        let mergeFolderIDs = [];
        for (let key in mergeFoldersData) {
            if (!mergeFoldersData.hasOwnProperty(key)) continue;

            mergeFolderIDs.push(mergeFoldersData[key].ID);
        }

        await database.updateMany({
            collectionData: folderCollectionData,
            filter: {ID: {$in: mergeFolderIDs}},
            updateData: {
                userID: toUserEntity.getID()
            }
        });
    };

    const mergeFolderPosts = async ({fromUserEntity, toUserEntity}) => {
        const postCollectionData = postEntity.getCollectionData();
        const mergePostsData = await database.findAll({
            collectionData: postCollectionData,
            filter: {
                userID: fromUserEntity.getID(),
                isDeleted: false
            },
            project: {
                ID: 1
            }
        });

        let mergePostIDs = [];
        for (let key in mergePostsData) {
            if (!mergePostsData.hasOwnProperty(key)) continue;

            mergePostIDs.push(mergePostsData[key].ID);
        }

        await database.updateMany({
            collectionData: postCollectionData,
            filter: {ID: {$in: mergePostIDs}},
            updateData: {
                userID: toUserEntity.getID()
            }
        });
    };

    const setUserAsMerged = async ({fromUser, toUser, userCollectionData}) => {
        let userData = objectHelpers.transformEntityIntoASimpleObject(fromUser);
        userData.status = userEntity.getUserStatuses().STATUS_MERGED;
        userData.parentID = toUser.getID();

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const newUser = buildUser(userData);

        await database.updateEntity({
            collectionData: userCollectionData,
            entityData: newUser
        });
    };

    const filterAllowedFromUserStatuses = (userStatuses) => {
        return [
            userStatuses.STATUS_GUEST,
            userStatuses.STATUS_AUTHORIZED,
            userStatuses.STATUS_DISABLED,
            userStatuses.STATUS_BANNED
        ];
    };

    const filterAllowedToUserStatuses = (userStatuses) => {
        return [
            userStatuses.STATUS_GUEST,
            userStatuses.STATUS_AUTHORIZED
        ];
    };

    return async (
        {
            fromUserID,
            toUserID
        }
    ) => {
        if (
            !database.isID(fromUserID)
            || !database.isID(toUserID)
        ) {
            throw new RequestError(errorPrefix + "provided input is invalid", {
                fromUserID,
                toUserID
            });
        }

        const userCollectionData = userEntity.getCollectionData();
        const userStatuses = userEntity.getUserStatuses();
        const allowedFromUserStatuses = filterAllowedFromUserStatuses(userStatuses);
        const allowedToUserStatuses = filterAllowedToUserStatuses(userStatuses);

        const fromUserEntity = await getUserEntity({
            filter: {
                ID: fromUserID,
                status: {$in: allowedFromUserStatuses}
            },
            userCollectionData
        });
        if (validators.isNull(fromUserEntity)) {
            throw new RequestError(errorPrefix + "invalid from user", {
                fromUserID
            });
        }

        const toUserEntity = await getUserEntity({
            filter: {
                ID: toUserID,
                status: {$in: allowedToUserStatuses}
            },
            userCollectionData
        });
        if (validators.isNull(toUserEntity)) {
            throw new RequestError(errorPrefix + "invalid to user", {
                toUserID
            });
        }

        await mergeFolderContent({
            fromUserEntity,
            toUserEntity
        });
        await setUserAsMerged({
            fromUser: fromUserEntity,
            toUser: toUserEntity,
            userCollectionData
        });

        await insertUserLog({
            toUser: toUserEntity,
            fromUser: fromUserEntity
        });
    }
};

module.exports = mergeUsersFactory;