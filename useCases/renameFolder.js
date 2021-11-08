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
        updateEntityInDatabase
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
        const folderData = {
            ID: oldFolder.getID(),
            userID: oldFolder.getUserID(),
            name,
            isDeleted: oldFolder.getIsDeleted()
        };
        if (typeof oldFolder.getParentID === "function") {
            folderData.parentID = oldFolder.getParentID();
        }

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

        const userLogOriginalData = {
            ID: oldFolder.getID(),
            userID: oldFolder.getUserID(),
            name: oldFolder.getName(),
            isDeleted: oldFolder.getIsDeleted()
        };
        if (typeof oldFolder.getParentID === "function") {
            userLogOriginalData.parentID = oldFolder.getParentID();
        }
        await insertUserLog({
            userID,
            folderID: oldFolder.getID(),
            originalData: userLogOriginalData
        });

        const newFolderData = {
            ID: newFolder.getID(),
            userID: newFolder.getUserID(),
            name: newFolder.getName(),
            isDeleted: newFolder.getIsDeleted()
        };
        if (typeof newFolder.getParentID === "function") {
            newFolderData.parentID = newFolder.getParentID();
        }

        return Object.freeze(newFolderData);
    }
};

module.exports = renameFolderFactory;