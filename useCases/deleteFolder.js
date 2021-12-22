const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "delete folder use case error: ";

let deleteFolderFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isNull,
        isBoolean,
        findOneFromDatabase,
        updateInDatabase,
        generateDatabaseID,
        isPopulatedObject,
        insertEntityIntoDatabase,
        isTimestamp,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, folderID}) => {
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
            description: "Deleted a folder",
            additional: {
                folderID
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const deleteFolder = async ({folderData, folderCollectionData}) => {
        folderData.isDeleted = true;

        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });
        const folder = buildFolder(folderData);

        await updateInDatabase({
            collectionData: folderCollectionData,
            ID: folder.getID(),
            updateData: {
                isDeleted: folder.getIsDeleted()
            }
        });

        return folder;
    };

    return async (
        {
            userID,
            folderID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(folderID)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const folderCollectionData = folderEntity.getCollectionData();

        const folderData = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID,
                ID: folderID,
                isDeleted: false
            }
        });
        if (isNull(folderData)) {
            throw new Error(errorPrefix + "folder not found");
        }

        const folder = await deleteFolder({
            folderCollectionData,
            folderData
        });

        await insertUserLog({
            userID,
            folderID
        });

        const newFolderData = transformEntityIntoASimpleObject(folder, [
            "ID",
            "userID",
            "name",
            "parentID",
            "isDeleted"
        ]);
        return Object.freeze(newFolderData);
    }
};

module.exports = deleteFolderFactory;