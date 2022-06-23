const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const numberHelpers = require("../helpers/number");
const textHelpers = require("../helpers/text");
const debug = require("../adapters/debugAdapter");
const addPostUseCaseFactory = require("../useCases/addPost");
const renamePostUseCaseFactory = require("../useCases/renamePost");
const movePostUseCaseFactory = require("../useCases/movePost");
const deletePostUseCaseFactory = require("../useCases/deletePost");
const changePostPinStatusUseCaseFactory = require("../useCases/changePostPinStatus");
const setPostNoteUseCaseFactory = require("../useCases/setPostNote");
const getInputDetailsFactory = require("../useCases/getInputDetails");
const getSimpleFolderTreeFactory = require("../useCases/getSimpleFolderTree");
const managerConnector = require("../adapters/managerConnectorAdapter");
const imageFileAdapter = require("../adapters/fileAdapters/imageFileAdapter");
const RequestError = require("../errors/RequestError");

const getInputDetails = async (req, res) => {
    const postInput = req.query.input;
    const sessionUserID = req.currentUserID;
    let post, folderTree;

    const getInputDetailsUseCase = getInputDetailsFactory({
        validators,
        database,
        processPostInput: managerConnector.getPostDetailsFromInput,
        RequestError
    });

    const getSimpleFolderTreeUseCase = getSimpleFolderTreeFactory({
        validators,
        database,
        RequestError
    });

    try {
        post = await getInputDetailsUseCase({
            userID: sessionUserID,
            postInput
        });

        folderTree = await getSimpleFolderTreeUseCase({
            userID: sessionUserID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        post,
        folderTree
    });
};

const add = async (req, res) => {
    const url = req.body.url;
    const data = req.body.data;
    const name = req.body.name;
    const note = req.body.note;
    const provider = req.body.provider;
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
        validators,
        database,
        objectHelpers,
        textHelpers,
        processPostInput: managerConnector.getPostDetailsFromInput,
        imageProcessorObject: imageFileAdapter,
        RequestError
    });

    try {
        post = await addPostContentsUseCase({
            userID: sessionUserID,
            url,
            data,
            name,
            note,
            provider,
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
        validators,
        database,
        objectHelpers,
        RequestError
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
        validators,
        database,
        objectHelpers,
        RequestError
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
        validators,
        database,
        objectHelpers,
        RequestError
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
        validators,
        database,
        objectHelpers,
        RequestError
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
        validators,
        database,
        objectHelpers,
        RequestError
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

module.exports = {
    getInputDetails,
    add,
    rename,
    move,
    remove,
    changePinStatus,
    setNote
};