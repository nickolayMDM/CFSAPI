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
        insertMultipleIntoDatabase,
        generateUserCookie
    }
) => {
    return async (
        {
            deviceValue,
            IP
        }
    ) => {
        const userCollectionData = userEntity.getCollectionData();
        const userID = generateDatabaseID({
            collectionData: userCollectionData
        });
        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const user = buildUser({
            ID: userID
        });

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
            description: userLogDescription
        });

        await insertMultipleIntoDatabase({
            insertArray: [
                {
                    collectionData: userCollectionData,
                    data: {
                        ID: user.getID(),
                        status: user.getStatus()
                    }
                },
                {
                    collectionData: userLogCollectionData,
                    data: {
                        ID: userLog.getID(),
                        userID: userLog.getUserID(),
                        description: userLog.getDescription(),
                        timestamp: userLog.getTimestamp()
                    }
                }
            ]
        });

        const cookie = await generateUserCookie({
            deviceValue,
            IP,
            userID
        });

        return {
            ID: userID,
            cookie
        };
    }
};

module.exports = generateGuestUserFactory;