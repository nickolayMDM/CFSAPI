const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

let generateGuestUserFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        insertEntityIntoDatabase,
        generateUserCookie
    }
) => {
    const insertUserLog = async ({userID, cookie, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Generated as a guest";
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
                cookie,
                deviceValue,
                IP
            }
        });
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const generateUser = async ({userID, userCollectionData}) => {
        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const user = buildUser({
            ID: userID
        });

        await insertEntityIntoDatabase({
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
        const userCollectionData = userEntity.getCollectionData();
        const userID = generateDatabaseID({
            collectionData: userCollectionData
        });

        const user = await generateUser({
            userID,
            userCollectionData
        });

        const cookie = await generateUserCookie({
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