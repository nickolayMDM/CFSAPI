const folder = require("./folderEntity");

const errorPrefix = "post entity validation error: ";
const collectionName = "posts";

const buildPostFactory = (
    {
        database,
        validators
    }
) => {
    return (
        {
            ID,
            userID,
            folderID,
            originalData,
            url,
            name,
            author,
            note = "",
            isDeleted = false,
            isPinned = false
        } = {}
    ) => {
        let postObject = {
            getID: () => ID,
            getUserID: () => userID,
            getOriginalData: () => originalData,
            getUrl: () => url,
            getName: () => name,
            getNote: () => note,
            getIsDeleted: () => isDeleted,
            getIsPinned: () => isPinned
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!database.isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (validators.isDefined(folderID)) {
            if (!database.isID(folderID)) {
                throw new Error(errorPrefix + "folder ID value must be a valid identifier.");
            }

            postObject.getFolderID = () => folderID;
        }

        if (!validators.isJsonString(originalData)) {
            throw new Error(errorPrefix + "original data value must be a json string.");
        }

        if (!validators.isUrl(url)) {
            throw new Error(errorPrefix + "url value must be a valid url.");
        }

        if (!validators.isPopulatedString(name)) {
            throw new Error(errorPrefix + "name value must be a populated string.");
        }

        if (!validators.isString(note)) {
            throw new Error(errorPrefix + "note value must be a string.");
        }
        if (!validators.isStringWithin(note, 0, 80)) {
            throw new Error(errorPrefix + "note maximum length must be 80 characters.");
        }

        if (validators.isDefined(author)) {
            if (!validators.isPopulatedString(author)) {
                throw new Error(errorPrefix + "author name must be a populated string.");
            }

            postObject.getAuthor = () => author;
        }

        if (!validators.isBoolean(isDeleted)) {
            throw new Error(errorPrefix + "is deleted value has to be a boolean.");
        }

        if (!validators.isBoolean(isPinned)) {
            throw new Error(errorPrefix + "is pinned value has to be a boolean.");
        }

        return Object.freeze(postObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName,
        parentCollectionName: folder.getCollectionData().name
    };
};

module.exports = {buildPostFactory, getCollectionData};