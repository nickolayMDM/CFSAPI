const userEntity = require("../entities/userEntity");
const postEntity = require("../entities/postEntity");
const folderEntity = require("../entities/folderEntity");
const userLogEntity = require("../entities/userLogEntity");

let mergeUsersFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        findOneFromDatabase,
        findAllFromDatabase,
        insertEntityIntoDatabase,
        updateManyInDatabase,
        updateEntityInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({toUser, fromUser}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Merged users";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID: toUser.getID(),
            description: userLogDescription,
            additional: {
                mergedUser: fromUser.getID()
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const getUserEntity = async ({userID, userCollectionData}) => {
        const userData = await findOneFromDatabase({
            collectionData: userCollectionData,
            filter: {
                ID: userID
            }
        });

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        return buildUser(userData);
    };

    const mergeFolderContent = async ({fromUserEntity, toUserEntity}) => {
        await mergeFolderFolders({fromUserEntity, toUserEntity});
        await mergeFolderPosts({fromUserEntity, toUserEntity});
    };

    const mergeFolderFolders = async ({fromUserEntity, toUserEntity}) => {
        const folderCollectionData = folderEntity.getCollectionData();
        const mergeFoldersData = await findAllFromDatabase({
            collectionData: folderCollectionData,
            filter: {
                userID: fromUserEntity.getID(),
                isDeleted: false
            },
            project: {
                ID: 1
            }
        });

        let mergeFolderIDs = [];
        for (let key in mergeFoldersData) {
            if (!mergeFoldersData.hasOwnProperty(key)) continue;

            mergeFolderIDs.push(mergeFoldersData[key].ID);
        }

        await updateManyInDatabase({
            collectionData: folderCollectionData,
            filter: {ID: {$in: mergeFolderIDs}},
            updateData: {
                userID: toUserEntity.getID()
            }
        });
    };

    const mergeFolderPosts = async ({fromUserEntity, toUserEntity}) => {
        const postCollectionData = postEntity.getCollectionData();
        const mergePostsData = await findAllFromDatabase({
            collectionData: postCollectionData,
            filter: {
                userID: fromUserEntity.getID(),
                isDeleted: false
            },
            project: {
                ID: 1
            }
        });

        let mergePostIDs = [];
        for (let key in mergePostsData) {
            if (!mergePostsData.hasOwnProperty(key)) continue;

            mergePostIDs.push(mergePostsData[key].ID);
        }

        await updateManyInDatabase({
            collectionData: postCollectionData,
            filter: {ID: {$in: mergePostIDs}},
            updateData: {
                userID: toUserEntity.getID()
            }
        });
    };

    const setUserAsMerged = async ({user, userCollectionData}) => {
        let userData = transformEntityIntoASimpleObject(user);
        userData.status = userEntity.getUserStatuses().STATUS_MERGED;

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const newUser = buildUser(userData);

        await updateEntityInDatabase({
            collectionData: userCollectionData,
            entityData: newUser
        });
    };

    return async (
        {
            fromUserID,
            toUserID
        }
    ) => {
        if (
            !isID(fromUserID)
            || !isID(toUserID)
        ) {
            throw new Error("provided input is invalid");
        }

        const userCollectionData = userEntity.getCollectionData();

        const fromUserEntity = await getUserEntity({
            userID: fromUserID,
            userCollectionData
        });
        if (isNull(fromUserEntity)) {
            throw new Error("merge function did not found an entity to merge from");
        }

        const toUserEntity = await getUserEntity({
            userID: toUserID,
            userCollectionData
        });
        if (isNull(toUserEntity)) {
            throw new Error("merge function did not found an entity to merge to");
        }

        await mergeFolderContent({
            fromUserEntity,
            toUserEntity
        });
        await setUserAsMerged({
            user: fromUserEntity,
            userCollectionData
        });

        await insertUserLog({
            toUser: toUserEntity,
            fromUser: fromUserEntity
        });
    }
};

module.exports = mergeUsersFactory;