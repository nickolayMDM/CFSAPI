const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "rename folder use case error: ";

let renameFolderFactory = (
    {
        validators,
        database,
        objectHelpers,
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
            description: "Renamed a folder",
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

    const renameFolder = async ({oldFolder, name, folderCollectionData}) => {
        let folderData = objectHelpers.transformEntityIntoASimpleObject(oldFolder, [
            "ID",
            "userID",
            "isDeleted",
            "parentID"
        ]);
        folderData.name = name;

        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const folder = buildFolder(folderData);

        await database.updateEntity({
            collectionData: folderCollectionData,
            entityData: folder
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
            name,
            userID,
            folderID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(folderID)
            || !validators.isPopulatedString(name)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                name,
                userID,
                folderID
            });
        }
        const folderCollectionData = folderEntity.getCollectionData();
        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });
        if (validators.isNull(oldFolder)) {
            throw new RequestError(errorPrefix + "could not access the folder", {
                name,
                userID,
                folderID
            });
        }

        const existingFolder = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                userID,
                name,
                isDeleted: false
            }
        });
        if (!validators.isNull(existingFolder)) {
            throw new RequestError(errorPrefix + "folder with this name already exists", {
                userID,
                name
            });
        }

        await renameFolder({
            oldFolder,
            name,
            folderCollectionData
        });

        const userLogOriginalData = objectHelpers.transformEntityIntoASimpleObject(oldFolder, [
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

        const newFolderData = objectHelpers.transformEntityIntoASimpleObject(oldFolder, [
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