const errorPrefix = "server log entity validation error: ";
const collectionName = "serverLogs";

const buildServerLogFactory = (
    {
        database,
        validators
    }
) => {
    return (
        {
            ID,
            name,
            message,
            stack,
            payload,
            timestamp = Date.now()
        } = {}
    ) => {
        let serverLogObject = {
            getID: () => ID,
            getName: () => name,
            getMessage: () => message,
            getStack: () => stack,
            getTimestamp: () => timestamp
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!validators.isPopulatedString(name)) {
            throw new Error(errorPrefix + "name has to be a non-empty string.");
        }

        if (!validators.isPopulatedString(message)) {
            throw new Error(errorPrefix + "message has to be a non-empty string.");
        }

        if (!validators.isPopulatedString(stack)) {
            throw new Error(errorPrefix + "stack has to be a non-empty string.");
        }

        if (!validators.isTimestamp(timestamp)) {
            throw new Error(errorPrefix + "timestamp has an invalid value.");
        }

        if (validators.isDefined(payload)) {
            if (!validators.isPopulatedObject(payload)) {
                throw new Error(errorPrefix + "payload should be either undefined or a populated object.");
            }

            serverLogObject.getPayload = () => payload;
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