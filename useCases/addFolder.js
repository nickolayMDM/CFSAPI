const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "add folder use case error: ";

let addFolderFactory = (
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
            description: "Posted a folder",
            additional: {
                folderID
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const findParentInDatabase = async ({userID, parentID, folderCollectionData}) => {
        return await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID,
                ID: parentID
            }
        });
    };

    const insertFolder = async ({userID, parentID, name, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });

        const folder = buildFolder({
            ID: generateDatabaseID({collectionName: folderCollectionData.name}),
            userID,
            name,
            parentID
        });

        await insertEntityIntoDatabase({
            collectionData: folderCollectionData,
            entityData: folder
        });

        return folder;
    };

    return async (
        {
            name,
            userID,
            parentID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isPopulatedString(name)
            || (
                isDefined(parentID)
                && !isID(parentID)
            )) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const folderCollectionData = folderEntity.getCollectionData();

        if (isDefined(parentID)) {
            const parentFolder = await findParentInDatabase({
                folderCollectionData,
                userID,
                parentID
            });

            if (isNull(parentFolder)) {
                throw new Error(errorPrefix + "parent folder not found");
            }
        }

        const existingFolder = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID,
                parentID: parentID,
                name: name
            }
        });
        if (!isNull(existingFolder)) {
            throw new Error(errorPrefix + "folder with this name already exists");
        }

        const folder = await insertFolder({
            userID,
            parentID,
            name,
            folderCollectionData
        });

        await insertUserLog({
            userID,
            folderID: folder.getID()
        });

        let folderData = transformEntityIntoASimpleObject(folder, [
            "ID",
            "name",
            "parentID"
        ]);
        return Object.freeze(folderData);
    }
};

module.exports = addFolderFactory;