const userLogEntity = require("../entities/userLogEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "set user as premium use case error: ";

let setUserAsPremiumFactory = (
    {
        validators,
        database,
        objectHelpers,
        timeHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, paymentID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Added a payment",
            additional: {
                paymentID
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const setPremiumTime = async ({oldUser, endTimestamp}) => {
        let userData = objectHelpers.transformEntityIntoASimpleObject(oldUser);
        userData.subscriptionType = userEntity.getUserSubscriptions().SUBSCRIPTION_PREMIUM;
        if (!validators.isFutureTimestamp(endTimestamp)) {
            endTimestamp = timeHelpers.getMonthForwardTimestamp(userData.subscriptionEndTimestamp);
        }
        userData.subscriptionEndTimestamp = endTimestamp;

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });

        const user = buildUser(userData);

        await database.updateEntity({
            collectionData: userEntity.getCollectionData(),
            entityData: user
        });

        return user;
    };

    const getUser = async ({userID}) => {
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
            validators,
            database
        });
        const user = buildUser(userData);

        return user;
    };

    return async (
        {
            userID,
            endTimestamp
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || (
                validators.isDefined(endTimestamp)
                && !validators.isTimestamp(endTimestamp)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                endTimestamp
            });
        }

        const oldUser = await getUser({userID});
        if (validators.isNull(oldUser)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID
            });
        }

        const user = await setPremiumTime({
            oldUser,
            endTimestamp
        });

        await insertUserLog({
            userID,
            endTimestamp
        });

        let paymentData = objectHelpers.transformEntityIntoASimpleObject(user, [
            "ID",
            "subscriptionType",
            "subscriptionEndTimestamp"
        ]);
        return Object.freeze(paymentData);
    }
};

module.exports = setUserAsPremiumFactory;