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

    const addIsEmptyToFolders = async ({folders, userID, folderCollectionData}) => {
        if (folders.length < 1) {
            return folders;
        }

        const postCollectionData = postEntity.getCollectionData();
        let folderIDToArrayKeyCorrelation = {};
        let folderIDs = folders.reduce((accumulator, value, index) => {
            folders[index].isEmpty = true;
            folderIDToArrayKeyCorrelation[value.ID] = index;
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
        const folderCounts = await database.count({
            collectionData: folderCollectionData,
            filter: {
                parentID: {$in: folderIDs},
                isDeleted: false,
                userID
            },
            group: "parentID"
        });

        for (let key in postCounts) {
            if (!postCounts.hasOwnProperty(key)) continue;

            const ID = postCounts[key].ID.toString();
            const foldersArrayKey = folderIDToArrayKeyCorrelation[ID];
            const isEmpty = !validators.isPositiveInt(postCounts[key].count);
            if (!isEmpty) folders[foldersArrayKey].isEmpty = isEmpty;
        }
        for (let key in folderCounts) {
            if (!folderCounts.hasOwnProperty(key)) continue;

            const ID = folderCounts[key].ID.toString();
            const foldersArrayKey = folderIDToArrayKeyCorrelation[ID];
            const isEmpty = !validators.isPositiveInt(folderCounts[key].count);
            if (!isEmpty) folders[foldersArrayKey].isEmpty = isEmpty;
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

    const getParentFolderData = async ({originFolder, folderCollectionData}) => {
        if (
            !validators.isPopulatedObject(originFolder)
            || !validators.isFunction(originFolder.getParentID)
        ) {
            return {};
        }

        const folderData = await database.findOne({
            collectionData: folderCollectionData,
            filter: {
                ID: originFolder.getParentID(),
                userID: originFolder.getUserID(),
                isDeleted: false
            }
        });
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const folder = buildFolder(folderData);

        return objectHelpers.transformEntityIntoASimpleObject(folder, [
            "ID",
            "name"
        ]);
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
        let originFolder;
        const folderCollectionData = folderEntity.getCollectionData();

        if (validators.isDefined(folderID)) {
            originFolder = await getFolderFromDatabase({
                userID,
                folderID,
                folderCollectionData
            });

            if (validators.isNull(originFolder)) {
                throw new RequestError(errorPrefix + "folder not found", {
                    userID,
                    folderID
                });
            }
        }

        let parent = await getParentFolderData({
            originFolder,
            folderCollectionData
        });
        let folders = await findAllFolders({
            userID,
            folderID
        });
        folders = await addIsEmptyToFolders({
            folders,
            userID,
            folderCollectionData
        });
        let posts = await findAllPosts({
            userID,
            folderID
        });
        let response = {
            folders,
            posts,
            parent
        };

        await insertUserLog({
            userID,
            folderID
        });

        if (validators.isDefined(folderID)) {
            let folderData = objectHelpers.transformEntityIntoASimpleObject(originFolder, [
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