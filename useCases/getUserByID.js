const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "get user by ID use case error: ";

let getUserByIDFactory = (
    {
        validators,
        database,
        RequestError
    }
) => {
    const insertUserLog = async ({userID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Got user by ID";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: userLogDescription
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    return async (
        {
            userID
        }
    ) => {
        if (!database.isID(userID)) {
            throw new RequestError(errorPrefix + "provided input is invalid", {
                userID
            });
        }

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

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser(userData);

        await insertUserLog({
            userID
        });

        return user;
    }
};

module.exports = getUserByIDFactory;