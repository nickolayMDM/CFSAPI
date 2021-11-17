const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const getFolderContentsUseCaseFactory = require("../useCases/getFolderContents");
const addFolderUseCaseFactory = require("../useCases/addFolder");
const renameFolderUseCaseFactory = require("../useCases/renameFolder");
const moveFolderUseCaseFactory = require("../useCases/moveFolder");
const deleteFolderUseCaseFactory = require("../useCases/deleteFolder");

const getContents = async (req, res) => {
    const folderID = req.query.folder;
    const sessionUserID = req.currentUserID;
    let contents = {};

    const getFolderContentsUseCase = getFolderContentsUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isBoolean: validators.isBoolean,
        isNull: validators.isNull,
        generateDatabaseID: database.generateID,
        findAllFromDatabase: database.findAll,
        findOneFromDatabase: database.findOne,
        insertIntoDatabase: database.insert,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });
    try {
        contents = await getFolderContentsUseCase({
            userID: sessionUserID,
            folderID
        });
    } catch (e) {
        let errorStatus = 500;
        if (e instanceof TypeError) {
            errorStatus = 400;
        }
        return res.status(errorStatus).json({error: e.message});
    }

    return res.status(200).json(contents);
};

const post = async (req, res) => {
    const name = req.body.name;
    const sessionUserID = req.currentUserID;
    let parentIDString = req.body.parent;
    let parentID, folder;

    if (typeof parentIDString === "object") {
        parentIDString = parentIDString._id;
    }
    if (database.isID(parentIDString)) {
        parentID = database.transformStringIDToObject(parentIDString);
    }

    const addFolderContentsUseCase = addFolderUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        folder = await addFolderContentsUseCase({
            userID: sessionUserID,
            name,
            parentID
        });
    } catch (e) {
        let errorStatus = 500;
        if (e instanceof TypeError) {
            errorStatus = 400;
        }
        return res.status(errorStatus).json({error: e.message});
    }


    return res.status(200).json(folder);
};

const rename = async (req, res) => {
    const name = req.body.name;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const renameFolderUseCase = renameFolderUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        updateEntityInDatabase: database.updateEntity,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });
    const folder = await renameFolderUseCase({
        userID: sessionUserID,
        name,
        folderID
    });

    return res.status(200).json(folder);
};

const move = async (req, res) => {
    const parentIDString = req.body.parent;
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID, parentID;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }
    if (database.isID(parentIDString)) {
        parentID = database.transformStringIDToObject(parentIDString);
    }

    const moveFolderUseCase = moveFolderUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        updateInDatabase: database.update,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });
    const folder = await moveFolderUseCase({
        userID: sessionUserID,
        parentID,
        folderID
    });

    return res.status(200).json(folder);
};

const remove = async (req, res) => {
    const folderIDString = req.body.folder;
    const sessionUserID = req.currentUserID;
    let folderID;

    if (database.isID(folderIDString)) {
        folderID = database.transformStringIDToObject(folderIDString);
    }

    const deleteFolderUseCase = deleteFolderUseCaseFactory({
        isDefined: validators.isDefined,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isNull: validators.isNull,
        isBoolean: validators.isBoolean,
        findOneFromDatabase: database.findOne,
        updateInDatabase: database.update,
        generateDatabaseID: database.generateID,
        isPopulatedObject: validators.isPopulatedObject,
        insertEntityIntoDatabase: database.insertEntity,
        isTimestamp: validators.isTimestamp,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });
    const folder = await deleteFolderUseCase({
        userID: sessionUserID,
        folderID
    });

    return res.status(200).json(folder);
};

module.exports = { getContents, post, rename, move, remove };