const errorPrefix = "user entity validation error: ";
const collectionName = "users";

const STATUS_GUEST = "guest";
const STATUS_AUTHORIZED = "authorized";
const STATUS_MERGED = "merged";
const STATUS_BANNED = "banned";
const STATUS_DISABLED = "disabled";

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
        isDefined,
        isEmail,
        isWithin,
        isID
    }
) => {
    return (
        {
            ID,
            name,
            email,
            status = STATUS_GUEST,
            parentID
        } = {}
    ) => {
        let userObject = {
            getID: () => ID,
            getStatus: () => status,
            getIsActive: () => !isWithin(status, DISABLED_STATUSES),
            getIsMerged: () => status === STATUS_MERGED
        };

        if (!isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (isDefined(name)) {
            if (typeof name !== "string") {
                throw new Error(errorPrefix + "name field has to be a string.");
            }

            if (name.length < 3) {
                throw new Error(errorPrefix + "length of the name has to be at least 3 characters.");
            }

            userObject.getName = () => name;
        }

        if (isDefined(email)) {
            if (!isEmail(email)) {
                throw new Error(errorPrefix + "invalid email format.");
            }

            userObject.getEmail = () => email;
        }

        if (status === STATUS_MERGED && !isID(parentID)) {
            throw new Error(errorPrefix + "merged users need parent IDs.");
        }

        if (!isWithin(status, AVAILABLE_STATUSES)) {
            throw new Error(errorPrefix + "wrong status value.");
        }

        if (isDefined(parentID)) {
            if (!isWithin(status, CHILDREN_STATUSES)) {
                throw new Error(errorPrefix + "parent ID should only be defined for merged users.");
            }

            if (!isID(parentID)) {
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

module.exports = {buildUserFactory, getCollectionData, getUserStatuses};