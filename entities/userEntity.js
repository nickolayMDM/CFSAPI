const errorPrefix = "user entity validation error: ";
const collectionName = "users";

const STATUS_GUEST = "guest";
const STATUS_AUTHORIZED = "authorized";
const STATUS_MERGED = "merged";
const STATUS_BANNED = "banned";
const STATUS_DISABLED = "disabled";

const SUBSCRIPTION_FREE = "free";
const SUBSCRIPTION_PREMIUM = "premium";
const AVAILABLE_SUBSCRIPTIONS = [
    SUBSCRIPTION_FREE,
    SUBSCRIPTION_PREMIUM
];
const DEFAULT_SUBSCRIPTION = SUBSCRIPTION_FREE;

const AVAILABLE_STATUSES = [
    STATUS_GUEST,
    STATUS_AUTHORIZED,
    STATUS_MERGED,
    STATUS_BANNED,
    STATUS_DISABLED
];

const DISABLED_STATUSES = [
    STATUS_MERGED,
    STATUS_BANNED,
    STATUS_DISABLED
];

const CHILDREN_STATUSES = [
    STATUS_GUEST,
    STATUS_MERGED
];

const buildUserFactory = (
    {
        database,
        validators
    }
) => {
    return (
        {
            ID,
            name,
            email,
            status = STATUS_GUEST,
            subscriptionType = DEFAULT_SUBSCRIPTION,
            subscriptionEndTimestamp,
            parentID
        } = {}
    ) => {
        let userObject = {
            getID: () => ID,
            getStatus: () => status,
            getIsActive: () => !validators.isWithin(status, DISABLED_STATUSES),
            getIsMerged: () => status === STATUS_MERGED,
            getSubscriptionType: () => subscriptionType
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (validators.isDefined(name)) {
            if (typeof name !== "string") {
                throw new Error(errorPrefix + "name field has to be a string.");
            }

            if (name.length < 3) {
                throw new Error(errorPrefix + "length of the name has to be at least 3 characters.");
            }

            userObject.getName = () => name;
        }

        if (validators.isDefined(email)) {
            if (!validators.isEmail(email)) {
                throw new Error(errorPrefix + "invalid email format.");
            }

            userObject.getEmail = () => email;
        }

        if (status === STATUS_MERGED && !database.isID(parentID)) {
            throw new Error(errorPrefix + "merged users need parent IDs.");
        }

        if (!validators.isWithin(status, AVAILABLE_STATUSES)) {
            throw new Error(errorPrefix + "wrong status value.");
        }

        if (!validators.isWithin(subscriptionType, AVAILABLE_SUBSCRIPTIONS)) {
            throw new Error(errorPrefix + "wrong subscription value.");
        }
        if (subscriptionType === SUBSCRIPTION_PREMIUM) {
            if (validators.isTimestamp(subscriptionEndTimestamp)) {
                if (Date.now() > subscriptionEndTimestamp) {
                    subscriptionType = DEFAULT_SUBSCRIPTION;
                }

                userObject.getSubscriptionEndTimestamp = () => subscriptionEndTimestamp;
            }
        }

        if (validators.isDefined(parentID)) {
            if (!validators.isWithin(status, CHILDREN_STATUSES)) {
                throw new Error(errorPrefix + "parent ID should only be defined for merged users.");
            }

            if (!database.isID(parentID)) {
                throw new Error(errorPrefix + "parent value must be a valid identifier.");
            }

            if (ID === parentID) {
                throw new Error(errorPrefix + "entity can not be its own parent (ID === parentID).");
            }

            userObject.getParentID = () => parentID;
        }

        return Object.freeze(userObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName
    };
};

const getUserStatuses = () => {
    let resultObject = {};
    resultObject.STATUS_GUEST = STATUS_GUEST;
    resultObject.STATUS_AUTHORIZED = STATUS_AUTHORIZED;
    resultObject.STATUS_MERGED = STATUS_MERGED;
    resultObject.STATUS_BANNED = STATUS_BANNED;
    resultObject.STATUS_DISABLED = STATUS_DISABLED;

    return resultObject;
};

const getUserSubscriptions = () => {
    let resultObject = {};
    resultObject.SUBSCRIPTION_FREE = SUBSCRIPTION_FREE;
    resultObject.SUBSCRIPTION_PREMIUM = SUBSCRIPTION_PREMIUM;

    return resultObject;
};

module.exports = {buildUserFactory, getCollectionData, getUserStatuses, getUserSubscriptions};