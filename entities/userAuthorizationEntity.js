const user = require("./userEntity");

const VARIANT_PASSWORD = "password";
const VARIANT_TIKTOK = "tiktok";

const errorPrefix = "user authorization entity validation error: ";
const collectionName = "userAuthorizations";

const buildUserAuthorizationFactory = (
    {
        database,
        validators
    }
) => {
    return (
        {
            ID,
            userID,
            variant,
            token,
            additional,
            isActive = true
        } = {}
    ) => {
        let userAuthorizationObject = {
            getID: () => ID,
            getUserID: () => userID,
            getVariant: () => variant,
            getToken: () => token,
            getIsActive: () => isActive
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!database.isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!validators.isWithin(variant, [VARIANT_PASSWORD, VARIANT_TIKTOK])) {
            throw new Error(errorPrefix + "wrong variant value.");
        }

        if (!validators.isPopulatedString(token)) {
            throw new Error(errorPrefix + "token has to be an non-empty string.");
        }

        if (!validators.isBoolean(isActive)) {
            throw new Error(errorPrefix + "is active value has to be a boolean.");
        }

        if (variant === VARIANT_PASSWORD) {
            if (!validators.isPopulatedObject(additional) || !validators.isPopulatedString(additional.password)) {
                throw new Error(errorPrefix + "password variant needs an additional password value.");
            }

            userAuthorizationObject.getAdditional = () => additional;
        }

        return Object.freeze(userAuthorizationObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName,
        parentEntity: user,
        parentConnectionField: "userID"
    };
};

const getUserAuthorizationVariants = () => {
    let resultObject = {};
    resultObject.VARIANT_PASSWORD = VARIANT_PASSWORD;

    return resultObject;
};

module.exports = {buildUserAuthorizationFactory, getCollectionData, getUserAuthorizationVariants};