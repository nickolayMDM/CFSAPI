const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "add post use case error: ";

let addPostFactory = (
    {
        validators,
        database,
        objectHelpers,
        processPostInput,
        imageProcessorObject,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, postID}) => {
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
            description: "Added a post item",
            additional: {
                postID
            }
        });
        await database.insertEntity({
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
            validators,
            database
        });

        const post = buildPost({
            ID: postID,
            userID,
            folderID,
            name: (validators.isPopulatedString(name)) ? name : postInputData.name,
            originalData: JSON.stringify(postInputData.originalData),
            url,
            author: postInputData.author
        });

        await database.insertEntity({
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
            !database.isID(userID)
            || !validators.isUrl(url)
            || !validators.isPopulatedString(name)
            || (
                validators.isDefined(folderID)
                && !database.isID(folderID)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                folderID,
                name,
                url,
                data
            });
        }

        const folderData = await database.findOne({
            collectionData: folderEntity.getCollectionData(),
            filter: {
                ID: folderID,
                userID,
                isDeleted: false
            }
        });
        if (validators.isDefined(folderID) && validators.isNull(folderData)) {
            throw new RequestError(errorPrefix + "folder not found", {
                folderID,
                userID
            });
        }

        const postCollectionData = postEntity.getCollectionData();
        const existingPost = await database.findOne({
            collectionData: postCollectionData,
            filter: {
                userID,
                folderID,
                isDeleted: false,
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
        if (!validators.isNull(existingPost)) {
            throw new RequestError(errorPrefix + "this entry was already added", {
                userID,
                folderID,
                name,
                url
            });
        }

        const postInput = (validators.isPopulatedObject(data)) ? data : url;
        const processPostInputResult = await processPostInput({
            postInput
        });
        const postID = database.generateID({
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

        let postData = objectHelpers.transformEntityIntoASimpleObject(post, [
            "ID",
            "name",
            "url",
            "folderID"
        ]);
        return Object.freeze(postData);
    }
};

module.exports = addPostFactory;