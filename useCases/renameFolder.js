const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "rename folder use case error: ";

let renameFolderFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateEntityInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, folderID, originalData}) => {
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
            description: "Renamed a folder",
            additional: {
                originalData,
                folderID
            }
        });

        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const renameFolder = async ({oldFolder, name, folderCollectionData}) => {
        let folderData = transformEntityIntoASimpleObject(oldFolder, [
            "ID",
            "userID",
            "isDeleted",
            "parentID"
        ]);
        folderData.name = name;

        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });
        const folder = buildFolder(folderData);

        await updateEntityInDatabase({
            collectionData: folderCollectionData,
            entityData: folder
        });

        return folder;
    };

    const getFolderFromDatabase = async ({userID, folderID, folderCollectionData}) => {
        const folderData = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                ID: folderID,
                userID
            }
        });
        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });

        return buildFolder(folderData);
    };

    return async (
        {
            name,
            userID,
            folderID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(folderID)
            || !isPopulatedString(name)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const folderCollectionData = folderEntity.getCollectionData();
        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });

        const existingFolder = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID,
                folderID: oldFolder.getID(),
                name
            }
        });
        if (!isNull(existingFolder)) {
            throw new Error(errorPrefix + "folder with this name already exists");
        }

        const newFolder = await renameFolder({
            oldFolder,
            name,
            folderCollectionData
        });

        const userLogOriginalData = transformEntityIntoASimpleObject(oldFolder, [
            "ID",
            "userID",
            "name",
            "isDeleted",
            "parentID",
        ]);
        await insertUserLog({
            userID,
            folderID: oldFolder.getID(),
            originalData: userLogOriginalData
        });

        const newFolderData = transformEntityIntoASimpleObject(oldFolder, [
            "ID",
            "userID",
            "name",
            "isDeleted",
            "parentID",
        ]);
        return Object.freeze(newFolderData);
    }
};

module.exports = renameFolderFactory;