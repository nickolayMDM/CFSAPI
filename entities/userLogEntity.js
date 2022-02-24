const user = require("./userEntity");

const errorPrefix = "user log entity validation error: ";
const collectionName = "userLogs";

const buildUserLogFactory = (
    {
        database,
        validators
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

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!database.isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!validators.isPopulatedString(description)) {
            throw new Error(errorPrefix + "description has to be a non-empty string.");
        }

        if (validators.isDefined(additional)) {
            if (!validators.isPopulatedObject(additional)) {
                throw new Error(errorPrefix + "additional data has to be an non-empty object.");
            }

            userLogObject.getAdditional = () => additional;
        }

        if (!validators.isTimestamp(timestamp)) {
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