const userEntity = require("../entities/userEntity");
const userAuthorizationEntity = require("../entities/userAuthorizationEntity");
const userLogEntity = require("../entities/userLogEntity");

let getUserByTokenFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        generateDatabaseID,
        findOneFromDatabase,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isBoolean,
        isHash,
        isPopulatedArray,
        insertEntityIntoDatabase,
        generateUserCookie,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, token, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "User login by authorization attempt";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp
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
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    return async (
        {
            variant,
            token,
            deviceValue,
            IP
        }
    ) => {
        const userAuthorizationData = await findOneFromDatabase({
            collectionData: userAuthorizationEntity.getCollectionData(),
            filter: {
                variant,
                token
            }
        });
        if (isNull(userAuthorizationData)) {
            throw new Error("user authorization method not found");
        }

        const buildUserAuthorization = userAuthorizationEntity.buildUserAuthorizationFactory({
            isID,
            isPopulatedString,
            isBoolean,
            isWithin,
            isHash,
            isPopulatedArray
        });
        const userAuthorization = buildUserAuthorization(userAuthorizationData);

        const userData = await findOneFromDatabase({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userAuthorization.getUserID()
            }
        });
        if (isNull(userData)) {
            throw new Error("user not found");
        }

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const user = buildUser(userData);

        await insertUserLog({
            userID: user.getID(),
            token,
            deviceValue,
            IP
        });

        let resultData = transformEntityIntoASimpleObject(user, [
            "name",
            "email",
            "status"
        ]);
        const cookie = await generateUserCookie({
            deviceValue,
            IP,
            userID: user.getID()
        });
        resultData.cookie = cookie;

        return resultData;
    }
};

module.exports = getUserByTokenFactory;