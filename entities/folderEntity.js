const user = require("./userEntity");

const errorPrefix = "folder entity validation error: ";
const collectionName = "folders";

const buildFolderFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isBoolean
    }
) => {
    return (
        {
            ID,
            userID,
            name,
            parentID,
            isDeleted = false,
            isPinned = false
        } = {}
    ) => {
        let folderObject = {
            getID: () => ID,
            getUserID: () => userID,
            getName: () => name,
            getIsDeleted: () => isDeleted,
            getIsPinned: () => isPinned
        };

        if (!isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!isPopulatedString(name)) {
            throw new Error(errorPrefix + "name has to be a non-empty string.");
        }

        if (isDefined(parentID)) {
            if (!isID(parentID)) {
                throw new Error(errorPrefix + "parent ID value must be a valid identifier.");
            }

            folderObject.getParentID = () => parentID;
        }

        if (!isBoolean(isDeleted)) {
            throw new Error(errorPrefix + "is deleted value has to be a boolean.");
        }

        if (!isBoolean(isPinned)) {
            throw new Error(errorPrefix + "is pinned value has to be a boolean.");
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