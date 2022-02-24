const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "delete post use case error: ";

let deletePostFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, postID}) => {
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
            description: "Deleted a post item",
            additional: {
                postID
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const deletePost = async ({postData, postCollectionData}) => {
        postData.isDeleted = true;

        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });
        const post = buildPost(postData);

        await database.update({
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
            !database.isID(userID)
            || !database.isID(postID)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                postID
            });
        }
        const postCollectionData = postEntity.getCollectionData();

        const postData = await database.findOne({
            collectionData: postCollectionData,
            filter: {
                userID,
                ID: postID,
                isDeleted: false
            }
        });
        if (validators.isNull(postData)) {
            throw new RequestError(errorPrefix + "post not found", {
                userID,
                postID
            });
        }

        const post = await deletePost({
            postCollectionData,
            postData
        });

        await insertUserLog({
            userID,
            postID
        });

        const newPostData = objectHelpers.transformEntityIntoASimpleObject(post, [
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