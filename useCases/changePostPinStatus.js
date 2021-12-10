const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "change post pin use case error: ";

let changePostPinFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        isJsonString,
        isUrl,
        isString,
        isStringWithin,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, postID, originalData, isPinned}) => {
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
            description: "Set a post item pin status",
            additional: {
                originalData,
                isPinned,
                postID
            }
        });

        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const changePostPinStatus = async ({oldPost, isPinned, postCollectionData}) => {
        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl,
            isString,
            isStringWithin
        });

        const postData = transformEntityIntoASimpleObject(oldPost);

        if (isBoolean(isPinned)) {
            postData.isPinned = isPinned;
        }
        const post = buildPost(postData);

        await updateInDatabase({
            collectionData: postCollectionData,
            ID: post.getID(),
            updateData: {
                isPinned: post.getIsPinned()
            }
        });

        return post;
    };

    const getPostFromDatabase = async ({userID, postID, postCollectionData}) => {
        const postData = await findOneFromDatabase({
            collectionData: postCollectionData,
            filter: {
                ID: postID,
                userID
            }
        });
        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl,
            isString,
            isStringWithin
        });

        return buildPost(postData);
    };

    return async (
        {
            userID,
            postID,
            isPinned
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(postID)
            || !isBoolean(isPinned)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }

        const postCollectionData = postEntity.getCollectionData();

        const oldPost = await getPostFromDatabase({
            userID,
            postID,
            postCollectionData
        });
        if (isNull(oldPost)) {
            throw new TypeError(errorPrefix + "post not found");
        }

        const newPost = await changePostPinStatus({
            oldPost,
            isPinned,
            postCollectionData
        });

        const userLogOriginalData = transformEntityIntoASimpleObject(oldPost);
        await insertUserLog({
            userID,
            folderID: oldPost.getID(),
            originalData: userLogOriginalData
        });

        const newPostData = transformEntityIntoASimpleObject(newPost);
        return Object.freeze(newPostData);
    }
};

module.exports = changePostPinFactory;