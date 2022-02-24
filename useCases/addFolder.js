const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "add folder use case error: ";

let addFolderFactory = (
    {
        validators,
        database,
        objectHelpers,
        config,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, folderID}) => {
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
            description: "Posted a folder",
            additional: {
                folderID
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
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

    const insertFolder = async ({userID, parentID, name, level, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });

        const folder = buildFolder({
            ID: database.generateID({collectionName: folderCollectionData.name}),
            userID,
            name,
            level,
            parentID
        });

        await database.insertEntity({
            collectionData: folderCollectionData,
            entityData: folder
        });

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
            name,
            userID,
            parentID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !validators.isPopulatedString(name)
            || (
                validators.isDefined(parentID)
                && !database.isID(parentID)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                name,
                userID,
                parentID
            });
        }
        const folderCollectionData = folderEntity.getCollectionData();
        let level = 1;

        const user = await getUser({userID});
        if (validators.isNull(user)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID
            });
        }

        if (validators.isDefined(parentID)) {
            const parentFolder = await findParentInDatabase({
                folderCollectionData,
                userID,
                parentID
            });
            level = parentFolder.getLevel() + 1;

            if (validators.isNull(parentFolder)) {
                throw new RequestError(errorPrefix + "parent folder not found", {
                    userID,
                    parentID
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
                name,
                isDeleted: false
            }
        });
        if (!validators.isNull(existingFolder) && typeof existingFolder !== "undefined") {
            throw new RequestError(errorPrefix + "folder with this name already exists", {
                userID,
                parentID,
                name,
            });
        }

        const folder = await insertFolder({
            userID,
            parentID,
            name,
            level,
            folderCollectionData
        });

        await insertUserLog({
            userID,
            folderID: folder.getID()
        });

        let folderData = objectHelpers.transformEntityIntoASimpleObject(folder, [
            "ID",
            "name",
            "parentID"
        ]);
        return Object.freeze(folderData);
    }
};

module.exports = addFolderFactory;