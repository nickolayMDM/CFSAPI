const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "change folder pin use case error: ";

let changeFolderPinFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        isJsonString,
        isUrl,
        isString,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, folderID, originalData, isPinned}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp
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

        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const changeFolderPinStatus = async ({oldFolder, isPinned, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl,
            isString
        });

        const folderData = transformEntityIntoASimpleObject(oldFolder);

        if (isBoolean(isPinned)) {
            folderData.isPinned = isPinned;
        }
        const folder = buildFolder(folderData);

        await updateInDatabase({
            collectionData: folderCollectionData,
            ID: folder.getID(),
            updateData: {
                isPinned: folder.getIsPinned()
            }
        });

        return folder;
    };

    const getFolderFromDatabase = async ({userID, folderID, folderCollectionData}) => {
        const folderData = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                ID: folderID,
                userID,
                isDeleted: false
            }
        });
        const buildPost = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl,
            isString
        });

        return buildPost(folderData);
    };

    return async (
        {
            userID,
            folderID,
            isPinned
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(folderID)
            || !isBoolean(isPinned)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }

        const folderCollectionData = folderEntity.getCollectionData();

        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });
        if (isNull(oldFolder)) {
            throw new TypeError(errorPrefix + "folder not found");
        }

        const newFolder = await changeFolderPinStatus({
            oldFolder,
            isPinned,
            folderCollectionData
        });

        const userLogOriginalData = transformEntityIntoASimpleObject(oldFolder);
        await insertUserLog({
            userID,
            folderID: oldFolder.getID(),
            originalData: userLogOriginalData
        });

        const newFolderData = transformEntityIntoASimpleObject(newFolder);
        return Object.freeze(newFolderData);
    }
};

module.exports = changeFolderPinFactory;