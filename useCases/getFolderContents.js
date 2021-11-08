const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "folder entity validation error: ";

let getFolderContentsFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isBoolean,
        isNull,
        generateDatabaseID,
        findAllFromDatabase,
        findOneFromDatabase,
        insertIntoDatabase
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
            description: "Getting folder contents",
            additional: {
                folderID
            }
        });
        await insertIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: {
                ID: userLog.getID(),
                userID: userLog.getUserID(),
                description: userLog.getDescription(),
                timestamp: userLog.getTimestamp()
            }
        });
    };

    const findAllFolders = async ({userID, folderID}) => {
        const folderCollectionData = folderEntity.getCollectionData();
        let filter = {
            userID,
            isDeleted: false
        };
        if (isID(folderID)) {
            filter.parentID = folderID;
        } else {
            filter.parentID = {$exists: false};
        }

        return await findAllFromDatabase({
            collectionData: folderCollectionData,
            filter
        });
    };

    const findAllPosts = async ({userID, folderID}) => {
        const postCollectionData = postEntity.getCollectionData();

        let filter = {
            userID,
            isDeleted: false
        };
        if (isID(folderID)) {
            filter.folderID = folderID;
        } else {
            filter.folderID = {$exists: false};
        }

        return findAllFromDatabase({
            collectionData: postCollectionData,
            filter
        });
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
            folderID
        } = {}
    ) => {
        if (
            !isID(userID)
            || (
                isDefined(folderID)
                && !isID(folderID)
            )) {
            throw new TypeError(errorPrefix + "invalid data passed");
        }
        let parentFolder;
        const folderCollectionData = folderEntity.getCollectionData();

        if (isDefined(folderID)) {
            parentFolder = await getFolderFromDatabase({
                userID,
                folderID,
                folderCollectionData
            });

            if (isNull(parentFolder)) {
                throw new Error(errorPrefix + "parent folder not found");
            }
        }

        let folders = await findAllFolders({
            userID,
            folderID
        });
        let posts = await findAllPosts({
            userID,
            folderID
        });
        let response = {
            folders,
            posts
        };

        await insertUserLog({
            userID,
            folderID
        });

        if (isDefined(folderID)) {
            let folderData = {
                _id: parentFolder.getID(),
                name: parentFolder.getName()
            };
            if (typeof parentFolder.getParentID === "function") {
                folderData.parentID = parentFolder.getParentID();
            }

            response.item = folderData;
        }
        return Object.freeze(response);
    }
};

module.exports = getFolderContentsFactory;