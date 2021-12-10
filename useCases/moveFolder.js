const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "edit folder use case error: ";

let moveFolderFactory = (
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
        updateInDatabase,
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
            description: "Moved a folder",
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

    const moveFolder = async ({oldFolder, parentID, folderCollectionData}) => {
        const buildFolder = folderEntity.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });
        const folderData = {
            ID: oldFolder.getID(),
            userID: oldFolder.getUserID(),
            name: oldFolder.getName(),
            isDeleted: oldFolder.getIsDeleted()
        };
        if (isID(parentID)) {
            folderData.parentID = parentID;
        }
        const folder = buildFolder(folderData);

        if (typeof folder.getParentID === "function") {
            await updateInDatabase({
                collectionData: folderCollectionData,
                ID: folder.getID(),
                updateData: {
                    parentID: folder.getParentID()
                }
            });
        } else {
            await updateInDatabase({
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
            userID,
            folderID,
            parentID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(folderID)
            || (isDefined(parentID) && !isID(parentID))
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const folderCollectionData = folderEntity.getCollectionData();
        const oldFolder = await getFolderFromDatabase({
            userID,
            folderID,
            folderCollectionData
        });

        if (isDefined(parentID)) {
            const parentFolder = await findOneFromDatabase({
                collectionData: folderCollectionData,
                filter: {
                    userID,
                    ID: parentID,
                }
            });

            if (isNull(parentFolder)) {
                throw new Error(errorPrefix + "parent folder not found");
            }
        }

        const existingFolder = await findOneFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID,
                parentID,
                name: oldFolder.getName()
            }
        });
        if (!isNull(existingFolder)) {
            throw new Error(errorPrefix + "folder with this name already exists");
        }

        const newFolder = await moveFolder({
            oldFolder,
            parentID,
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

module.exports = moveFolderFactory;