const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "rename post use case error: ";

let renamePostFactory = (
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
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateEntityInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, postID, originalData}) => {
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
            description: "Renamed a post item",
            additional: {
                originalData,
                postID
            }
        });

        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const renamePost = async ({oldPost, name, postCollectionData}) => {
        let postData = transformEntityIntoASimpleObject(oldPost, [
            "ID",
            "userID",
            "originalData",
            "url",
            "isDeleted",
            "folderID",
            "author",
        ]);
        postData.name = name;

        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl
        });
        const post = buildPost(postData);

        await updateEntityInDatabase({
            collectionData: postCollectionData,
            entityData: post
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
            isUrl
        });

        return buildPost(postData);
    };

    return async (
        {
            name,
            userID,
            postID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(postID)
            || !isPopulatedString(name)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const postCollectionData = postEntity.getCollectionData();
        const oldPost = await getPostFromDatabase({
            userID,
            postID,
            postCollectionData
        });

        const existingPostFilter = {
            userID,
            ID: postID,
            name
        };
        if (typeof oldPost.getFolderID === "function") {
            existingPostFilter.folderID = oldPost.getFolderID();
        }
        const existingPost = await findOneFromDatabase({
            collectionData: postCollectionData,
            filter: existingPostFilter
        });
        if (!isNull(existingPost)) {
            throw new Error(errorPrefix + "post with this name already exists");
        }

        const newPost = await renamePost({
            oldPost,
            name,
            postCollectionData
        });

        const userLogOriginalData = transformEntityIntoASimpleObject(oldPost);
        await insertUserLog({
            userID,
            postID: oldPost.getID(),
            originalData: userLogOriginalData
        });

        const newPostData = transformEntityIntoASimpleObject(newPost, [
            "ID",
            "userID",
            "name",
            "url",
            "isDeleted",
            "folderID",
            "author",
        ]);
        return Object.freeze(newPostData);
    }
};

module.exports = renamePostFactory;