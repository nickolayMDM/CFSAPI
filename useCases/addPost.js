const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "add post use case error: ";

let addPostFactory = (
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
        processPostInput,
        imageProcessorObject,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, postID}) => {
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
            description: "Added a post item",
            additional: {
                postID
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const saveImage = async ({url, postID}) => {
        let imageProcessor = new imageProcessorObject();
        await imageProcessor.setFromUrl(url);
        await _saveOriginalImage(imageProcessor, postID);

        await _saveSmallImage(imageProcessor, postID);
    };

    const _saveOriginalImage = async (imageProcessor, postID) => {
        const extension = imageProcessor.returnExtension();
        const path = "/public/images/postThumbnails/" + postID + "/original." + extension;

        await imageProcessor.saveToPath(path);
    };

    const _saveSmallImage = async (imageProcessor, postID) => {
        const extension = imageProcessor.returnExtension();
        const path = "/public/images/postThumbnails/" + postID + "/small163." + extension;

        await imageProcessor.resize({
            height: 163
        });
        await imageProcessor.saveToPath(path);
    };

    const addPost = async ({postID, userID, folderID, name, postInputData, postCollectionData, url}) => {
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

        const post = buildPost({
            ID: postID,
            userID,
            folderID,
            name: (isPopulatedString(name)) ? name : postInputData.name,
            originalData: JSON.stringify(postInputData.originalData),
            url,
            author: postInputData.author
        });

        await insertEntityIntoDatabase({
            collectionData: postCollectionData,
            entityData: post
        });

        return post;
    };

    return async (
        {
            userID,
            folderID,
            name,
            url,
            data
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isUrl(url)
            || (
                isDefined(name)
                && !isString(name)
            )
            || (
                isDefined(folderID)
                && !isID(folderID)
            )
        ) {
            throw new TypeError(errorPrefix + "invalid data passed");
        }

        const folderData = await findOneFromDatabase({
            collectionData: folderEntity.getCollectionData(),
            filter: {
                ID: folderID,
                userID,
                isDeleted: false
            }
        });
        if (isDefined(folderID) && isNull(folderData)) {
            throw new TypeError(errorPrefix + "folder not found");
        }

        const postCollectionData = postEntity.getCollectionData();
        const existingPost = await findOneFromDatabase({
            collectionData: postCollectionData,
            filter: {
                userID,
                folderID,
                $or: [
                    {
                        name
                    },
                    {
                        url
                    }
                ]
            }
        });
        if (!isNull(existingPost)) {
            throw new TypeError(errorPrefix + "this entry was already added");
        }

        const postInput = (isPopulatedObject(data)) ? data : url;
        const processPostInputResult = await processPostInput({
            postInput
        });
        const postID = generateDatabaseID({
            collectionName: postEntity.getCollectionData()
        });
        await saveImage({
            url: processPostInputResult.response.postDetails.imageUrl,
            postID
        });
        const post = await addPost({
            postID,
            userID,
            folderID,
            name,
            postInputData: processPostInputResult.response.postDetails,
            postCollectionData,
            url
        });

        await insertUserLog({
            userID,
            postID
        });

        let postData = transformEntityIntoASimpleObject(post, [
            "ID",
            "name",
            "url",
            "folderID"
        ]);
        return Object.freeze(postData);
    }
};

module.exports = addPostFactory;