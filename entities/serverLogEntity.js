const errorPrefix = "server log entity validation error: ";
const collectionName = "serverLogs";

const buildServerLogFactory = (
    {
        isID,
        isPopulatedString,
        isTimestamp
    }
) => {
    return (
        {
            ID,
            message,
            stack,
            timestamp = Date.now()
        } = {}
    ) => {
        let serverLogObject = {
            getID: () => ID,
            getMessage: () => message,
            getStack: () => stack,
            getTimestamp: () => timestamp
        };

        if (!isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!isPopulatedString(message)) {
            throw new Error(errorPrefix + "message has to be a non-empty string.");
        }

        if (!isPopulatedString(stack)) {
            throw new Error(errorPrefix + "stack has to be a non-empty string.");
        }

        if (!isTimestamp(timestamp)) {
            throw new Error(errorPrefix + "timestamp has an invalid value.");
        }

        return Object.freeze(serverLogObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName
    };
};

module.exports = {buildServerLogFactory, getCollectionData};