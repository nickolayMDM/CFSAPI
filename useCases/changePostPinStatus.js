const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "change post pin use case error: ";

let changePostPinFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, postID, originalData, isPinned}) => {
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
            description: "Set a post item pin status",
            additional: {
                originalData,
                isPinned,
                postID
            }
        });

        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const changePostPinStatus = async ({oldPost, isPinned, postCollectionData}) => {
        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });

        const postData = objectHelpers.transformEntityIntoASimpleObject(oldPost);

        if (validators.isBoolean(isPinned)) {
            postData.isPinned = isPinned;
        }
        const post = buildPost(postData);

        await database.update({
            collectionData: postCollectionData,
            ID: post.getID(),
            updateData: {
                isPinned: post.getIsPinned()
            }
        });

        return post;
    };

    const getPostFromDatabase = async ({userID, postID, postCollectionData}) => {
        const postData = await database.findOne({
            collectionData: postCollectionData,
            filter: {
                ID: postID,
                userID,
                isDeleted: false
            }
        });
        if (validators.isNull(postData)) {
            return null;
        }

        const buildPost = postEntity.buildPostFactory({
            validators,
            database
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
            !database.isID(userID)
            || !database.isID(postID)
            || !validators.isBoolean(isPinned)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                postID,
                isPinned
            });
        }

        const postCollectionData = postEntity.getCollectionData();

        const oldPost = await getPostFromDatabase({
            userID,
            postID,
            postCollectionData
        });
        if (validators.isNull(oldPost)) {
            throw new RequestError(errorPrefix + "post not found", {
                userID,
                postID
            });
        }

        const newPost = await changePostPinStatus({
            oldPost,
            isPinned,
            postCollectionData
        });

        const userLogOriginalData = objectHelpers.transformEntityIntoASimpleObject(oldPost);
        await insertUserLog({
            userID,
            folderID: oldPost.getID(),
            originalData: userLogOriginalData
        });

        const newPostData = objectHelpers.transformEntityIntoASimpleObject(newPost);
        return Object.freeze(newPostData);
    }
};

module.exports = changePostPinFactory;