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
        isString,
        isStringWithin,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateInDatabase,
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
            description: "Moved a post item",
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

    const movePost = async ({oldPost, folderID, postCollectionData}) => {
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
            isUrl,
            isString,
            isStringWithin
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

module.exports = movePostFactory;