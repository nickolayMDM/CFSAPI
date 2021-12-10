const user = require("./userEntity");

const VARIANT_PASSWORD = "password";
const VARIANT_TIKTOK = "tiktok";

const errorPrefix = "user authorization entity validation error: ";
const collectionName = "userAuthorizations";

const buildUserAuthorizationFactory = (
    {
        isID,
        isPopulatedString,
        isBoolean,
        isWithin,
        isPopulatedArray
    }
) => {
    return (
        {
            ID,
            userID,
            variant,
            token,
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

        if (!isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!isWithin(variant, [VARIANT_PASSWORD, VARIANT_TIKTOK])) {
            throw new Error(errorPrefix + "wrong variant value.");
        }

        if (variant === VARIANT_PASSWORD) {
            const passwordTokenDataArray = token.split(",");
            if (
                !isPopulatedArray(passwordTokenDataArray)
                || passwordTokenDataArray.length !== 2
                || !isPopulatedString(passwordTokenDataArray[0])
                || !isPopulatedString(passwordTokenDataArray[1])
            ) {
                throw new Error(errorPrefix + "invalid token for password variant.");
            }
        }

        if (!isPopulatedString(token)) {
            throw new Error(errorPrefix + "token has to be an non-empty string.");
        }

        if (!isBoolean(isActive)) {
            throw new Error(errorPrefix + "is active value has to be a boolean.");
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