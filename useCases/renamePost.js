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
        updateEntityInDatabase
    }
) => {
    const insertUserLog = async ({userID, folderID, originalData}) => {
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
            description: "Renamed a folder",
            additional: {
                originalData,
                folderID
            }
        });

        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const renamePost = async ({oldPost, name, postCollectionData}) => {
        const postData = {
            ID: oldPost.getID(),
            userID: oldPost.getUserID(),
            originalData: oldPost.getOriginalData(),
            url: oldPost.getUrl(),
            name,
            isDeleted: oldPost.getIsDeleted()
        };
        if (typeof oldPost.getFolderID === "function") {
            postData.folderID = oldPost.getFolderID();
        }
        if (typeof oldPost.getImageUrl === "function") {
            postData.imageUrl = oldPost.getImageUrl();
        }
        if (typeof oldPost.getAuthor === "function") {
            postData.author = oldPost.getAuthor();
        }

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

        // const userLogOriginalData = {
        //     ID: oldFolder.getID(),
        //     userID: oldFolder.getUserID(),
        //     name: oldFolder.getName(),
        //     isDeleted: oldFolder.getIsDeleted()
        // };
        // if (typeof oldFolder.getParentID === "function") {
        //     userLogOriginalData.parentID = oldFolder.getParentID();
        // }
        // await insertUserLog({
        //     userID,
        //     folderID: oldFolder.getID(),
        //     originalData: userLogOriginalData
        // });

        //TODO: reoccurring code piece - move to entity as a function
        const newPostData = {
            ID: newPost.getID(),
            userID: newPost.getUserID(),
            name: newPost.getName(),
            url: newPost.getUrl(),
            isDeleted: newPost.getIsDeleted()
        };
        if (typeof newPost.getFolderID === "function") {
            newPostData.folderID = newPost.getFolderID();
        }
        if (typeof newPost.getImageUrl === "function") {
            newPostData.imageUrl = newPost.getImageUrl();
        }
        if (typeof newPost.getAuthor === "function") {
            newPostData.author = newPost.getAuthor();
        }
        return Object.freeze(newPostData);
    }
};

module.exports = renamePostFactory;