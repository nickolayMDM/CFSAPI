const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

let getUserByCookieFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        generateUserCookie,
        generateDatabaseID,
        findOneFromDatabase,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        insertEntityIntoDatabase
    }
) => {
    const insertUserLog = async ({userID, realCookieValue, cookieValue, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "User login by cookie attempt";
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
                realCookieValue,
                cookieValue,
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
            userID,
            cookieValue,
            deviceValue,
            IP
        }
    ) => {
        const realCookieValue = await generateUserCookie({
            deviceValue,
            IP,
            userID
        });

        if (realCookieValue !== cookieValue) {
            //TODO: create custom error objects that would contain additional data that will be saved in the database
            console.log(realCookieValue, cookieValue);
            throw new Error("cookie value does not match the provided data");
        }

        const userData = await findOneFromDatabase({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (isNull(userData)) {
            throw new Error("user was not found in the database");
        }

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
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