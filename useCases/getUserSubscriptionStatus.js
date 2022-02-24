const userEntity = require("../entities/userEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "get user subscription status use case error: ";

let getSubscriptionStatusFactory = (
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
        const userLogDescription = "Got user subscription status";
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

    const buildSubscriptionStatusData = async ({user}) => {
        return {
            type: user.getSubscriptionType(),
            endTimestamp: user.getSubscriptionEndTimestamp()
        };
    };

    const getUserByID = async ({userID}) => {
        const userData = await database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            return null;
        }

        const buildUser = userEntity.buildUserFactory({
            database,
            validators
        });
        const user = buildUser(userData);

        return user;
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

        const user = getUserByID({userID});
        if (validators.isNull(user)) {
            throw new RequestError(errorPrefix + "user was not found in the database");
        }

        const subscriptionStatusData = buildSubscriptionStatusData({
            user
        });

        await insertUserLog({
            user
        });

        return subscriptionStatusData;
    }
};

module.exports = getSubscriptionStatusFactory;