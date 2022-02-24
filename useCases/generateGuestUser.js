const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "generate guest user use case error: ";

let generateGuestUserFactory = (
    {
        validators,
        database,
        userCookieGenerator,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, cookie, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Generated as a guest";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: userLogDescription,
            additional: {
                cookie,
                deviceValue,
                IP
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const generateUser = async ({userID, userCollectionData}) => {
        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser({
            ID: userID
        });

        await database.insertEntity({
            collectionData: userCollectionData,
            entityData: user
        });

        return user;
    };

    return async (
        {
            deviceValue,
            IP,
            deviceString
        }
    ) => {
        if (
            !validators.isPopulatedString(deviceValue)
            || !validators.isPopulatedString(IP)
            || (
                validators.isDefined(deviceString)
                && !validators.isPopulatedString(deviceString)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                deviceValue,
                IP,
                deviceString
            });
        }

        const userCollectionData = userEntity.getCollectionData();
        const userID = database.generateID({
            collectionData: userCollectionData
        });

        await generateUser({
            userID,
            userCollectionData
        });

        const cookie = await userCookieGenerator.generateUserCookie({
            deviceValue,
            IP,
            userID,
            deviceString
        });

        await insertUserLog({
            userID,
            deviceValue,
            IP,
            cookie
        });

        return {
            ID: userID,
            cookie
        };
    }
};

module.exports = generateGuestUserFactory;