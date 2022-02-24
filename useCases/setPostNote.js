const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "set post note use case error: ";

let setPostNoteFactory = (
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
            description: "Changed a post item note",
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

    const setPostNote = async ({oldPost, note, postCollectionData}) => {
        let postData = objectHelpers.transformEntityIntoASimpleObject(oldPost);
        postData.note = note;

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
        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });

        return buildPost(postData);
    };

    return async (
        {
            note,
            userID,
            postID
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !database.isID(postID)
            || !validators.isString(note)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                note,
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

        const newPost = await setPostNote({
            oldPost,
            note,
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

module.exports = setPostNoteFactory;