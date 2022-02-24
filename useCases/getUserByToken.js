const userEntity = require("../entities/userEntity");
const userAuthorizationEntity = require("../entities/userAuthorizationEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "get user by token use case error: ";

let getUserByTokenFactory = (
    {
        validators,
        database,
        objectHelpers,
        userCookieGenerator,
        hashing,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, token, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "User login by authorization attempt";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: userLogDescription,
            additional: {
                token,
                deviceValue,
                IP
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const validatePasswordVariant = async (string, hash) => {
        return await hashing.compare(string, hash);
    };

    return async (
        {
            variant,
            token,
            deviceValue,
            additional,
            IP
        }
    ) => {
        const authorizationVariantsArray = Object.values(userAuthorizationEntity.getUserAuthorizationVariants());
        if (
            !validators.isWithin(variant, authorizationVariantsArray)
            || !validators.isPopulatedString(token)
            || !validators.isPopulatedString(deviceValue)
            || !validators.isPopulatedString(IP)
            || (
                validators.isDefined(additional)
                && !validators.isObject(additional)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                variant,
                token,
                deviceValue,
                additional,
                IP
            });
        }

        const userAuthorizationData = await database.findOne({
            collectionData: userAuthorizationEntity.getCollectionData(),
            filter: {
                variant,
                token
            }
        });
        if (validators.isNull(userAuthorizationData)) {
            throw new RequestError(errorPrefix + "user authorization method not found", {
                variant,
                token,
                deviceValue,
                IP,
                additional
            });
        }

        if (variant === userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD) {
            const passwordIsValid = await validatePasswordVariant(additional.password, userAuthorizationData.additional.password);
            if (!passwordIsValid) {
                throw new RequestError(errorPrefix + "password validation failed", {
                    variant,
                    token,
                    deviceValue,
                    IP,
                    additional
                });
            }
        }

        const buildUserAuthorization = userAuthorizationEntity.buildUserAuthorizationFactory({
            validators,
            database
        });
        const userAuthorization = buildUserAuthorization(userAuthorizationData);

        const userData = await database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userAuthorization.getUserID()
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID: userAuthorization.getUserID()
            });
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser(userData);

        await insertUserLog({
            userID: user.getID(),
            token,
            deviceValue,
            IP
        });

        let resultData = objectHelpers.transformEntityIntoASimpleObject(user, [
            "name",
            "email",
            "status",
            "subscriptionType"
        ]);
        const cookie = await userCookieGenerator.generateUserCookie({
            deviceValue,
            IP,
            userID: user.getID()
        });
        resultData.cookie = cookie;

        return resultData;
    }
};

module.exports = getUserByTokenFactory;