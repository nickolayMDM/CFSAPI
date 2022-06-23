const user = require("./userEntity");

const errorPrefix = "folder entity validation error: ";
const collectionName = "folders";

const buildFolderFactory = (
    {
        validators,
        database
    }
) => {
    return (
        {
            ID,
            userID,
            name,
            parentID,
            level = 1,
            position = 1,
            isDeleted = false,
            isPinned = false,
            createdTimestamp = Date.now()
        } = {}
    ) => {
        let folderObject = {
            getID: () => ID,
            getUserID: () => userID,
            getName: () => name,
            getLevel: () => level,
            getPosition: () => position,
            getIsDeleted: () => isDeleted,
            getIsPinned: () => isPinned,
            getCreatedTimestamp: () => createdTimestamp
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!database.isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!validators.isPopulatedString(name)) {
            throw new Error(errorPrefix + "name has to be a non-empty string.");
        }

        if (validators.isDefined(parentID)) {
            if (!database.isID(parentID)) {
                throw new Error(errorPrefix + "parent ID value must be a valid identifier.");
            }

            folderObject.getParentID = () => parentID;
        }

        if (!validators.isBoolean(isDeleted)) {
            throw new Error(errorPrefix + "is deleted value has to be a boolean.");
        }

        if (!validators.isBoolean(isPinned)) {
            throw new Error(errorPrefix + "is pinned value has to be a boolean.");
        }

        if (!validators.isInt(level)) {
            throw new Error(errorPrefix + "level must be an integer.");
        }

        if (!validators.isInt(position)) {
            throw new Error(errorPrefix + "position must be an integer.");
        }

        return Object.freeze(folderObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName,
        parentCollectionName: user.getCollectionData().name
    };
};

module.exports = {buildFolderFactory, getCollectionData};