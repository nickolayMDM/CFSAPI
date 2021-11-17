const userEntity = require("../entities/userEntity");

let getUserByIDFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        findOneFromDatabase,
        insertEntityIntoDatabase
    }
) => {
    const insertUserLog = async ({userID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Got user by ID";
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
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    return async (
        {
            userID
        }
    ) => {

        if (!isID(userID)) {
            throw new Error("provided input is invalid");
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
            userID
        });

        return user;
    }
};

module.exports = getUserByIDFactory;