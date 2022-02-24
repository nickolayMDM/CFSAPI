const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "get folder use case validation error: ";

let getFolderContentsFactory = (
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
            description: "Getting folder contents",
            additional: {
                folderID
            }
        });
        await database.insert({
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
        if (database.isID(folderID)) {
            filter.parentID = folderID;
        } else {
            filter.parentID = {$exists: false};
        }

        return await database.findAll({
            collectionData: folderCollectionData,
            filter,
            sort: {isPinned: -1}
        });
    };

    const findAllPosts = async ({userID, folderID}) => {
        const postCollectionData = postEntity.getCollectionData();

        let filter = {
            userID,
            isDeleted: false
        };
        if (database.isID(folderID)) {
            filter.folderID = folderID;
        } else {
            filter.folderID = {$exists: false};
        }

        return await database.findAll({
            collectionData: postCollectionData,
            filter,
            sort: {isPinned: -1}
        });
    };

    const addIsEmptyToFolders = async ({folders, userID}) => {
        if (folders.length < 1) {
            return folders;
        }

        const postCollectionData = postEntity.getCollectionData();
        let folderPostIDToArrayKeyCorrelation = {};
        let folderIDs = folders.reduce((accumulator, value, index) => {
            folders[index].isEmpty = true;
            folderPostIDToArrayKeyCorrelation[value.ID] = index;
            accumulator.push(value.ID);

            return accumulator;
        }, []);

        const postCounts = await database.count({
            collectionData: postCollectionData,
            filter: {
                folderID: {$in: folderIDs},
                isDeleted: false,
                userID
            },
            group: "folderID"
        });

        for (let key in postCounts) {
            const ID = postCounts[key].ID.toString();
            const foldersArrayKey = folderPostIDToArrayKeyCorrelation[ID];
            folders[foldersArrayKey].isEmpty = !validators.isPositiveInt(postCounts[key].count);
        }

        return folders;
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
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
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
            !database.isID(userID)
            || (
                validators.isDefined(folderID)
                && !database.isID(folderID)
            )) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID
            });
        }
        let parentFolder;
        const folderCollectionData = folderEntity.getCollectionData();

        if (validators.isDefined(folderID)) {
            parentFolder = await getFolderFromDatabase({
                userID,
                folderID,
                folderCollectionData
            });

            if (validators.isNull(parentFolder)) {
                throw new RequestError(errorPrefix + "parent folder not found", {
                    userID,
                    folderID
                });
            }
        }

        let folders = await findAllFolders({
            userID,
            folderID
        });
        folders = await addIsEmptyToFolders({
            folders,
            userID
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

        if (validators.isDefined(folderID)) {
            let folderData = objectHelpers.transformEntityIntoASimpleObject(parentFolder, [
                "ID",
                "name",
                "parentID"
            ]);

            response.item = folderData;
        }
        return Object.freeze(response);
    }
};

module.exports = getFolderContentsFactory;