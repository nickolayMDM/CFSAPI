const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "move post use case error: ";

let movePostFactory = (
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
            description: "Moved a post item",
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

    const movePost = async ({oldPost, folderID, postCollectionData}) => {
        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });

        const postData = objectHelpers.transformEntityIntoASimpleObject(oldPost);

        if (database.isID(folderID)) {
            postData.folderID = folderID;
        } else if (database.isID(postData.folderID)) {
            delete postData.folderID;
        }
        const post = buildPost(postData);

        if (typeof post.getFolderID === "function") {
            await database.update({
                collectionData: postCollectionData,
                ID: post.getID(),
                updateData: {
                    folderID: post.getFolderID()
                }
            });
        } else {
            await database.update({
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
            folderID,
            postID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(postID)
            || (validators.isDefined(folderID) && !database.isID(folderID))
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID,
                postID
            });
        }

        if (validators.isDefined(folderID)) {
            const folderData = await database.findOne({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    ID: folderID,
                    userID,
                    isDeleted: false
                }
            });

            if (validators.isNull(folderData)) {
                throw new RequestError(errorPrefix + "folder not found", {
                    folderID,
                    userID
                });
            }
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

        const existingPost = await database.findOne({
            collectionData: postCollectionData,
            filter: {
                userID,
                folderID,
                isDeleted: false,
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
        if (!validators.isNull(existingPost)) {
            throw new RequestError(errorPrefix + "destination folder already has a similar post", {
                userID,
                folderID,
                name: oldPost.getName(),
                originalData: oldPost.getOriginalData()
            });
        }

        const newPost = await movePost({
            oldPost,
            folderID,
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

module.exports = movePostFactory;