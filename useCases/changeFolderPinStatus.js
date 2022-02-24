const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "change folder pin status use case error: ";

let changeFolderPinFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, folderID, originalData, isPinned}) => {
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
            description: "Set a folder pin status",
            additional: {
                originalData,
                isPinned,
                folderID
            }
        });

        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const changeFolderPinStatus = async ({oldFolder, isPinned, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });

        const folderData = objectHelpers.transformEntityIntoASimpleObject(oldFolder);

        if (validators.isBoolean(isPinned)) {
            folderData.isPinned = isPinned;
        }
        const folder = buildFolder(folderData);

        await database.update({
            collectionData: folderCollectionData,
            ID: folder.getID(),
            updateData: {
                isPinned: folder.getIsPinned()
            }
        });

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

    return async (
        {
            userID,
            folderID,
            isPinned
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(folderID)
            || !validators.isBoolean(isPinned)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID,
                isPinned
            });
        }

        const folderCollectionData = folderEntity.getCollectionData();

        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });
        if (validators.isNull(oldFolder)) {
            throw new RequestError(errorPrefix + "folder not found", {
                userID,
                folderID
            });
        }

        const newFolder = await changeFolderPinStatus({
            oldFolder,
            isPinned,
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

module.exports = changeFolderPinFactory;