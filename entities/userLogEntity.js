const user = require("./userEntity");

const errorPrefix = "user log entity validation error: ";
const collectionName = "userLogs";

const buildUserLogFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp
    }
) => {
    return (
        {
            ID,
            userID,
            description,
            additional,
            timestamp = Date.now()
        } = {}
    ) => {
        let userLogObject = {
            getID: () => ID,
            getUserID: () => userID,
            getDescription: () => description,
            getTimestamp: () => timestamp
        };

        if (!isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!isPopulatedString(description)) {
            throw new Error(errorPrefix + "description has to be a non-empty string.");
        }

        if (isDefined(additional)) {
            if (!isPopulatedObject(additional)) {
                throw new Error(errorPrefix + "additional data has to be an non-empty object.");
            }

            userLogObject.getAdditional = () => additional;
        }

        if (!isTimestamp(timestamp)) {
            throw new Error(errorPrefix + "timestamp has an invalid value.");
        }

        return Object.freeze(userLogObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName,
        parentEntity: user,
        parentConnectionField: "userID"
    };
};

module.exports = {buildUserLogFactory, getCollectionData};