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
        findOneFromDatabase,
        updateInDatabase
    }
) => {
    //TODO: move all internal functions in use cases under the main return
    const deletePost = async ({postData, postCollectionData}) => {
        postData.isDeleted = true;

        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl
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

        const newPostData = {
            ID: post.getID(),
            userID: post.getUserID(),
            name: post.getName(),
            url: post.getUrl(),
            isDeleted: post.getIsDeleted()
        };
        if (typeof post.getFolderID === "function") {
            newPostData.folderID = post.getFolderID();
        }
        if (typeof post.getImageUrl === "function") {
            newPostData.imageUrl = post.getImageUrl();
        }
        if (typeof post.getAuthor === "function") {
            newPostData.author = post.getAuthor();
        }
        return Object.freeze(newPostData);
    }
};

module.exports = deletePostFactory;