const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "get user by cookie use case error: ";

let getUserByCookieFactory = (
    {

        validators,
        database,
        userCookieGenerator,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, realCookieValue, cookieValue, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "User login by cookie attempt";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: userLogDescription,
            additional: {
                realCookieValue,
                cookieValue,
                deviceValue,
                IP
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    return async (
        {
            userID,
            cookieValue,
            deviceValue,
            IP
        }
    ) => {
        if (
            !database.isID(userID)
            || !userCookieGenerator.isCookie(cookieValue)
            || !validators.isPopulatedString(deviceValue)
            || !validators.isPopulatedString(IP)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                cookieValue,
                deviceValue,
                IP
            });
        }

        const realCookieValue = await userCookieGenerator.generateUserCookie({
            deviceValue,
            IP,
            userID
        });

        const userData = await database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user was not found in the database", {
                userID
            });
        }

        if (realCookieValue !== cookieValue) {
            throw new RequestError(errorPrefix + "cookie value does not match the provided data", {
                realCookieValue,
                userID,
                cookieValue,
                deviceValue,
                IP
            });
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser(userData);

        await insertUserLog({
            userID,
            realCookieValue,
            cookieValue,
            deviceValue,
            IP
        });

        return user;
    }
};

module.exports = getUserByCookieFactory;