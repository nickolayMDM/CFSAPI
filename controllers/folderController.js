const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const numberHelpers = require("../helpers/number");
const debug = require("../adapters/debugAdapter");
const getFolderContentsUseCaseFactory = require("../useCases/getFolderContents");
const addFolderUseCaseFactory = require("../useCases/addFolder");
const renameFolderUseCaseFactory = require("../useCases/renameFolder");
const moveFolderUseCaseFactory = require("../useCases/moveFolder");
const deleteFolderUseCaseFactory = require("../useCases/deleteFolder");
const changeFolderPinStatusUseCaseFactory = require("../useCases/changeFolderPinStatus");
const getSimpleFolderTreeUseCaseFactory = require("../useCases/getSimpleFolderTree");
const RequestError = require("../errors/RequestError");
const config = require("../config");

const getContents = async (req, res) => {
    const folderID = req.query.folder;
    const sortBy = req.query.sortBy;
    const sessionUserID = req.currentUserID;
    let contents = {};

    const getFolderContentsUseCase = getFolderContentsUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        contents = await getFolderContentsUseCase({
            userID: sessionUserID,
            folderID,
            sortBy
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(contents);
};

const post = async (req, res) => {
    const name = req.body.name;
    const sessionUserID = req.currentUserID;
    let parentIDString = req.body.parent;
    let parentID, folder;

    if (validators.isObject(parentIDString)) {
        parentIDString = parentIDString.ID;
    }
    if (database.isID(parentIDString)) {
        parentID = database.transformStringIDToObject(parentIDString);
    }

    const addFolderContentsUseCase = addFolderUseCaseFactory({
        validators,
        database,
        objectHelpers,
        config,
        RequestError
    });

    try {
        folder = await addFolderContentsUseCase({
            userID: sessionUserID,
            name,
            parentID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(folder);
};

const rename = async (req, res) => {
    const name = req.body.name;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID, folder;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const renameFolderUseCase = renameFolderUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        folder = await renameFolderUseCase({
            userID: sessionUserID,
            name,
            folderID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(folder);
};

const move = async (req, res) => {
    const parentIDString = req.body.parent;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID, parentID, folder;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }
    if (database.isID(parentIDString)) {
        parentID = database.transformStringIDToObject(parentIDString);
    }

    const moveFolderUseCase = moveFolderUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        folder = await moveFolderUseCase({
            userID: sessionUserID,
            parentID,
            folderID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(folder);
};

const remove = async (req, res) => {
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID, folder;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const deleteFolderUseCase = deleteFolderUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        folder = await deleteFolderUseCase({
            userID: sessionUserID,
            folderID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(folder);
};

const changePinStatus = async (req, res) => {
    const isPinned = req.body.pin;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID, post;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const changeFolderPinStatusUseCase = changeFolderPinStatusUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        post = await changeFolderPinStatusUseCase({
            userID: sessionUserID,
            folderID,
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

const getSimpleFolderTree = async (req, res) => {
    const sessionUserID = req.currentUserID;
    let folderTree;

    const getSimpleFolderTree = getSimpleFolderTreeUseCaseFactory({
        validators,
        database,
        RequestError
    });

    try {
        folderTree = await getSimpleFolderTree({
            userID: sessionUserID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(folderTree);
};

module.exports = {getContents, post, rename, move, remove, changePinStatus, getSimpleFolderTree};