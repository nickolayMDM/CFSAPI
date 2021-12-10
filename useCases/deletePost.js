const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "delete post use case error: ";

let deletePostFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isNull,
        isBoolean,
        isJsonString,
        isUrl,
        isString,
        isStringWithin,
        findOneFromDatabase,
        updateInDatabase,
        insertEntityIntoDatabase,
        generateDatabaseID,
        isPopulatedObject,
        isTimestamp,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, postID}) => {
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
            description: "Deleted a post item",
            additional: {
                postID
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const deletePost = async ({postData, postCollectionData}) => {
        postData.isDeleted = true;

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
        const post = buildPost(postData);

        await updateInDatabase({
            collectionData: postCollectionData,
            ID: post.getID(),
            updateData: {
                isDeleted: post.getIsDeleted()
            }
        });

        return post;
    };

    return async (
        {
            userID,
            postID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(postID)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }
        const postCollectionData = postEntity.getCollectionData();

        //TODO: add isDeleted filter when searching for the entity to delete
        const postData = await findOneFromDatabase({
            collectionData: postCollectionData,
            filter: {
                userID,
                ID: postID,
                isDeleted: false
            }
        });
        if (isNull(postData)) {
            throw new Error(errorPrefix + "post not found");
        }

        const post = await deletePost({
            postCollectionData,
            postData
        });

        await insertUserLog({
            userID,
            postID
        });

        const newPostData = transformEntityIntoASimpleObject(post, [
            "ID",
            "userID",
            "name",
            "url",
            "isDeleted",
            "folderID",
            "author"
        ]);
        return Object.freeze(newPostData);
    }
};

module.exports = deletePostFactory;