const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "rename post use case error: ";

let renamePostFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, postID, originalData}) => {
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
            description: "Renamed a post item",
            additional: {
                originalData,
                postID
            }
        });

        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const renamePost = async ({oldPost, name, postCollectionData}) => {
        let postData = objectHelpers.transformEntityIntoASimpleObject(oldPost);
        postData.name = name;

        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });
        const post = buildPost(postData);

        await database.updateEntity({
            collectionData: postCollectionData,
            entityData: post
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
            name,
            userID,
            postID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(postID)
            || !validators.isPopulatedString(name)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                name,
                userID,
                postID
            });
        }
        const postCollectionData = postEntity.getCollectionData();
        const oldPost = await getPostFromDatabase({
            userID,
            postID,
            postCollectionData
        });
        if (validators.isNull(oldPost)) {
            throw new RequestError(errorPrefix + "could not access the folder", {
                name,
                userID,
                postID
            });
        }

        const existingPostFilter = {
            userID,
            name,
            isDeleted: false
        };
        if (typeof oldPost.getFolderID === "function") {
            existingPostFilter.folderID = oldPost.getFolderID();
        }
        const existingPost = await database.findOne({
            collectionData: postCollectionData,
            filter: existingPostFilter
        });
        if (!validators.isNull(existingPost)) {
            throw new RequestError(errorPrefix + "post with this name already exists", {
                userID,
                name,
                folderID: oldPost.getFolderID()
            });
        }

        const newPost = await renamePost({
            oldPost,
            name,
            postCollectionData
        });

        const userLogOriginalData = objectHelpers.transformEntityIntoASimpleObject(oldPost);
        await insertUserLog({
            userID,
            postID: oldPost.getID(),
            originalData: userLogOriginalData
        });

        const newPostData = objectHelpers.transformEntityIntoASimpleObject(newPost);
        return Object.freeze(newPostData);
    }
};

module.exports = renamePostFactory;