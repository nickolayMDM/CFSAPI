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
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase,
        processPostInput,
        imageProcessorObject
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
        await insertIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: {
                ID: userLog.getID(),
                userID: userLog.getUserID(),
                description: userLog.getDescription(),
                timestamp: userLog.getTimestamp(),
                additional: userLog.getAdditional()
            }
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
        const path = "/public/images/postThumbnails/" + postID + "/small80." + extension;

        await imageProcessor.resize({
            height: 80
        });
        await imageProcessor.saveToPath(path);
    };

    const addPost = async ({postID, userID, folderID, name, postInputData, postCollectionData, url, imagePath}) => {
        const buildPost = postEntity.buildPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean,
            isJsonString,
            isUrl
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
            console.log({
                userID,
                folderID,
                name,
                url,
                data
            });
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
        const imagePath = await saveImage({
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

        let postData = {
            ID: post.getID(),
            name: post.getName(),
            url: post.getUrl()
        };
        if (typeof post.getFolderID === "function") {
            postData.folderID = post.getFolderID();
        }

        return Object.freeze(postData);
    }
};

module.exports = addPostFactory;