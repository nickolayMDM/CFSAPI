const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");

const errorPrefix = "edit folder use case error: ";

let deleteFolderFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isNull,
        isBoolean,
        findOneFromDatabase,
        updateInDatabase
    }
) => {
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
                ID: folderID
            }
        });
        if (isNull(folderData)) {
            throw new Error(errorPrefix + "folder not found");
        }

        const folder = await deleteFolder({
            folderCollectionData,
            folderData
        });

        const newFolderData = {
            ID: folder.getID(),
            userID: folder.getUserID(),
            name: folder.getName(),
            isDeleted: folder.getIsDeleted()
        };
        if (typeof folder.getParentID === "function") {
            newFolderData.parentID = folder.getParentID();
        }
        return Object.freeze(newFolderData);
    }
};

module.exports = deleteFolderFactory;