const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "set post note use case error: ";

let setPostNoteFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isBoolean,
        isJsonString,
        isUrl,
        isString,
        isStringWithin,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        updateEntityInDatabase,
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
            description: "Changed a post item note",
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

    const setPostNote = async ({oldPost, note, postCollectionData}) => {
        let postData = transformEntityIntoASimpleObject(oldPost);
        postData.note = note;

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
                userID,
                isDeleted: false
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
            note,
            userID,
            postID
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isID(postID)
            || !isString(note)
        ) {
            throw new Error(errorPrefix + "invalid data passed");
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

        const userLogOriginalData = transformEntityIntoASimpleObject(oldPost);
        await insertUserLog({
            userID,
            postID: oldPost.getID(),
            originalData: userLogOriginalData
        });

        const newPostData = transformEntityIntoASimpleObject(newPost);
        return Object.freeze(newPostData);
    }
};

module.exports = setPostNoteFactory;