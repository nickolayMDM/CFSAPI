const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const numberHelpers = require("../helpers/number");
const debug = require("../adapters/debugAdapter");
const addPostUseCaseFactory = require("../useCases/addPost");
const renamePostUseCaseFactory = require("../useCases/renamePost");
const movePostUseCaseFactory = require("../useCases/movePost");
const deletePostUseCaseFactory = require("../useCases/deletePost");
const changePostPinStatusUseCaseFactory = require("../useCases/changePostPinStatus");
const setPostNoteUseCaseFactory = require("../useCases/setPostNote");
const managerConnector = require("../adapters/managerConnectorAdapter");
const imageFileAdapter = require("../adapters/fileAdapters/imageFileAdapter");

const getInputDetails = async (req, res) => {
    const postInput = req.query.input;
    const sessionUserID = req.currentUserID;
    let post;

    const processPostInput = managerConnector.getPostDetailsFromInput;

    //TODO: transform into a use case
    const errorPrefix = "temporary getInputDetails solution: ";
    if (
        !database.isID(sessionUserID)
        || !validators.isPopulatedString(postInput)
    ) {
        throw new TypeError(errorPrefix + "invalid data passed");
    }
    const processPostInputResult = await processPostInput({
        postInput
    });
    post = processPostInputResult.response.postDetails;

    return res.status(200).json(post);
};

const add = async (req, res) => {
    const url = req.body.url;
    const data = req.body.data;
    const name = req.body.name;
    const sessionUserID = req.currentUserID;
    let folderIDString = req.body.folder;
    let folderID, post;

    if (validators.isObject(folderIDString)) {
        folderIDString = folderIDString._id;
    }
    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const addPostContentsUseCase = addPostUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        processPostInput: managerConnector.getPostDetailsFromInput,
        imageProcessorObject: imageFileAdapter,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await addPostContentsUseCase({
            userID: sessionUserID,
            url,
            data,
            name,
            folderID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }


    return res.status(200).json(post);
};

const rename = async (req, res) => {
    const name = req.body.name;
    const postIDString = req.body.post;
    const sessionUserID = req.currentUserID;
    let postID, post;

    if (database.isID(postIDString)) {
        postID = database.transformStringIDToObject(postIDString);
    }

    const renamePostUseCase = renamePostUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        updateEntityInDatabase: database.updateEntity,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await renamePostUseCase({
            userID: sessionUserID,
            name,
            postID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(post);
};

const move = async (req, res) => {
    const postIDString = req.body.post;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let postID, folderID, post;

    if (database.isID(postIDString)) {
        postID = database.transformStringIDToObject(postIDString);
    }
    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const movePostUseCase = movePostUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        updateInDatabase: database.update,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await movePostUseCase({
            userID: sessionUserID,
            postID,
            folderID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(post);
};

const remove = async (req, res) => {
    const postIDString = req.body.post;
    const sessionUserID = req.currentUserID;
    let postID, post;

    if (database.isID(postIDString)) {
        postID = database.transformStringIDToObject(postIDString);
    }

    const deletePostUseCase = deletePostUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        findOneFromDatabase: database.findOne,
        updateInDatabase: database.update,
        insertEntityIntoDatabase: database.insertEntity,
        generateDatabaseID: database.generateID,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await deletePostUseCase({
            userID: sessionUserID,
            postID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(post);
};

const changePinStatus = async (req, res) => {
    const isPinned = req.body.pin;
    const postIDString = req.body.post;
    const sessionUserID = req.currentUserID;
    let postID, post;

    if (database.isID(postIDString)) {
        postID = database.transformStringIDToObject(postIDString);
    }

    const changePostPinStatusUseCase = changePostPinStatusUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        findOneFromDatabase: database.findOne,
        updateInDatabase: database.update,
        insertEntityIntoDatabase: database.insertEntity,
        generateDatabaseID: database.generateID,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await changePostPinStatusUseCase({
            userID: sessionUserID,
            postID,
            isPinned: numberHelpers.transformNumberToBoolean(isPinned)
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(post);
};

const setNote = async (req, res) => {
    const note = req.body.note;
    const postIDString = req.body.post;
    const sessionUserID = req.currentUserID;
    let postID, post;

    if (database.isID(postIDString)) {
        postID = database.transformStringIDToObject(postIDString);
    }

    const setPostNoteUseCase = setPostNoteUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isBoolean: validators.isBoolean,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isString: validators.isString,
        isStringWithin: validators.isStringWithin,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        updateEntityInDatabase: database.updateEntity,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        post = await setPostNoteUseCase({
            userID: sessionUserID,
            note,
            postID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(post);
};

module.exports = {getInputDetails, add, rename, move, remove, changePinStatus, setNote};