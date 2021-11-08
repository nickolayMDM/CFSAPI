const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

//TODO: check all error prefixes
const errorPrefix = "move post use case error: ";

let movePostFactory = (
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
        updateInDatabase
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
            description: "Moved a folder",
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

    const movePost = async ({oldPost, folderID, postCollectionData}) => {
        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl
        });
        //TODO: make an entity function to transform entity into a simple array
        const postData = {
            ID: oldPost.getID(),
            userID: oldPost.getUserID(),
            url: oldPost.getUrl(),
            originalData: oldPost.getOriginalData(),
            name: oldPost.getName(),
            isDeleted: oldPost.getIsDeleted()
        };
        if (typeof oldPost.getImageUrl === "function") {
            postData.imageUrl = oldPost.getImageUrl();
        }
        if (typeof oldPost.getAuthor === "function") {
            postData.author = oldPost.getAuthor();
        }

        if (isID(folderID)) {
            postData.folderID = folderID;
        }
        const post = buildPost(postData);

        if (typeof post.getFolderID === "function") {
            await updateInDatabase({
                collectionData: postCollectionData,
                ID: post.getID(),
                updateData: {
                    folderID: post.getFolderID()
                }
            });
        } else {
            await updateInDatabase({
                collectionData: postCollectionData,
                ID: post.getID(),
                unsetData: {
                    folderID: ""
                }
            });
        }


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
            userID,
            folderID,
            postID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(postID)
            || (isDefined(folderID) && !isID(folderID))
        ) {
            throw new Error(errorPrefix + "invalid data passed");
        }

        //TODO: add "isDeleted: false" to all database searches where only active should be displayed
        if (isDefined(folderID)) {
            const folderData = await findOneFromDatabase({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    ID: folderID,
                    userID,
                    isDeleted: false
                }
            });

            if (isNull(folderData)) {
                throw new TypeError(errorPrefix + "folder not found");
            }
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

        const existingPost = await findOneFromDatabase({
            collectionData: postCollectionData,
            filter: {
                userID,
                folderID,
                $or: [
                    {
                        name: oldPost.getName()
                    },
                    {
                        originalData: oldPost.getOriginalData()
                    }
                ]
            }
        });
        if (!isNull(existingPost)) {
            throw new TypeError(errorPrefix + "destination folder already has a similar post");
        }

        const newPost = await movePost({
            oldPost,
            folderID,
            postCollectionData
        });

        //TODO: add logging to all use cases
        //TODO: clean up use cases

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

module.exports = movePostFactory;