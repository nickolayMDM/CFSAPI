const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "move folder use case error: ";

let moveFolderFactory = (
    {
        validators,
        database,
        objectHelpers,
        config,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, folderID, originalData}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Moved a folder",
            additional: {
                originalData,
                folderID
            }
        });

        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const moveFolder = async ({oldFolder, parentID, level, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const folderData = {
            ID: oldFolder.getID(),
            userID: oldFolder.getUserID(),
            name: oldFolder.getName(),
            isDeleted: oldFolder.getIsDeleted(),
            level
        };
        if (database.isID(parentID)) {
            folderData.parentID = parentID;
        }
        const folder = buildFolder(folderData);

        if (typeof folder.getParentID === "function") {
            await database.update({
                collectionData: folderCollectionData,
                ID: folder.getID(),
                updateData: {
                    parentID: folder.getParentID()
                }
            });
        } else {
            await database.update({
                collectionData: folderCollectionData,
                ID: folder.getID(),
                unsetData: {
                    parentID: ""
                }
            });
        }


        return folder;
    };

    const getFolderFromDatabase = async ({userID, folderID, folderCollectionData}) => {
        const folderData = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                ID: folderID,
                userID,
                isDeleted: false
            }
        });
        if (validators.isNull(folderData)) {
            return null;
        }

        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });

        return buildFolder(folderData);
    };

    const findParentInDatabase = async ({userID, parentID, folderCollectionData}) => {
        const parentData = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                userID,
                ID: parentID,
                isDeleted: false
            }
        });
        if (validators.isNull(parentData)) {
            return null;
        }

        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const folder = buildFolder(parentData);

        return folder;
    };

    const getUser = async ({userID}) => {
        const userData = await database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            return null;
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser(userData);

        return user;
    };

    return async (
        {
            userID,
            folderID,
            parentID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(folderID)
            || (validators.isDefined(parentID) && !database.isID(parentID))
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID,
                parentID
            });
        }
        const folderCollectionData = folderEntity.getCollectionData();
        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });
        let level = 1;

        const user = await getUser({userID});
        if (validators.isNull(user)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID
            });
        }

        if (validators.isNull(oldFolder)) {
            throw new RequestError(errorPrefix + "could not access the folder", {
                userID,
                folderID,
                parentID
            });
        }

        if (validators.isDefined(parentID)) {
            const parentFolder = await findParentInDatabase({
                userID,
                parentID
            });
            level = parentFolder.getLevel() + 1;

            if (validators.isNull(parentFolder)) {
                throw new RequestError(errorPrefix + "parent folder not found", {
                    userID,
                    parentID,
                });
            }
        }

        if (
            validators.isDefined(config.folderLevelRestrictionsBySubscription[user.getSubscriptionType()])
            && level > config.folderLevelRestrictionsBySubscription[user.getSubscriptionType()]
        ) {
            throw new RequestError(errorPrefix + "current level depth for this user is restricted", {
                userID,
                level
            });
        }

        const existingFolder = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                userID,
                parentID,
                name: oldFolder.getName(),
                isDeleted: false
            }
        });
        if (!validators.isNull(existingFolder)) {
            throw new RequestError(errorPrefix + "folder with this name already exists", {
                userID,
                parentID,
                name: oldFolder.getName()
            });
        }

        const newFolder = await moveFolder({
            oldFolder,
            parentID,
            level,
            folderCollectionData
        });

        const userLogOriginalData = objectHelpers.transformEntityIntoASimpleObject(oldFolder);
        await insertUserLog({
            userID,
            folderID: oldFolder.getID(),
            originalData: userLogOriginalData
        });

        const newFolderData = objectHelpers.transformEntityIntoASimpleObject(newFolder);
        return Object.freeze(newFolderData);
    }
};

module.exports = moveFolderFactory;