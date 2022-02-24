const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "delete folder use case error: ";

let deleteFolderFactory = (
    {
        validators,
        database,
        objectHelpers,
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
            description: "Deleted a folder",
            additional: {
                folderID
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const deleteFolder = async ({folderData, folderCollectionData}) => {
        folderData.isDeleted = true;

        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const folder = buildFolder(folderData);

        await database.update({
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
            !database.isID(userID)
            || !database.isID(folderID)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID
            });
        }
        const folderCollectionData = folderEntity.getCollectionData();

        const folderData = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                userID,
                ID: folderID,
                isDeleted: false
            }
        });
        if (validators.isNull(folderData)) {
            throw new RequestError(errorPrefix + "folder not found", {
                userID,
                folderID
            });
        }

        const folder = await deleteFolder({
            folderCollectionData,
            folderData
        });

        await insertUserLog({
            userID,
            folderID
        });

        const newFolderData = objectHelpers.transformEntityIntoASimpleObject(folder, [
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