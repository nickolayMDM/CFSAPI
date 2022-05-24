const userLogEntity = require("../entities/userLogEntity");
const paymentEntity = require("../entities/paymentEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "add onetime premium payment use case error: ";

let addOnetimePremiumPaymentFactory = (
    {
        validators,
        database,
        objectHelpers,
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

    const insertPayment = async ({userID, status, details, timestamp, additional, paymentCollectionData}) => {
        const buildPayment = paymentEntity.buildPaymentFactory({
            validators,
            database
        });

        const payment = buildPayment({
            ID: database.generateID({collectionName: paymentCollectionData.name}),
            userID,
            type: paymentEntity.getPaymentTypes().TYPE_ONETIME,
            reason: paymentEntity.getPaymentReasons().REASON_PREMIUM,
            status,
            details,
            timestamp,
            additional
        });

        await database.insertEntity({
            collectionData: paymentCollectionData,
            entityData: payment
        });

        return payment;
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

    const getLocalStatus = ({paypalStatus}) => {
        const localStatuses = paymentEntity.getPaymentStatuses();

        if (paypalStatus.toLowerCase() === "completed") {
            return localStatuses.STATUS_SUCCESS;
        }

        return localStatuses.STATUS_PENDING
    };

    return async (
        {
            userID,
            status,
            details,
            timestamp,
            additional
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || (
                validators.isDefined(status)
                && !validators.isPopulatedString(status)
            )
            || (
                validators.isDefined(details)
                && !validators.isPopulatedObject(details)
            )
            || (
                validators.isDefined(timestamp)
                && !validators.isTimestamp(timestamp)
            )
            || (
                validators.isDefined(additional)
                && !validators.isPopulatedObject(additional)
            )
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                status,
                details,
                timestamp,
                additional
            });
        }
        const paymentCollectionData = paymentEntity.getCollectionData();

        //TODO: make a separate function; maybe in the userEntity?
        const user = await getUser({userID});
        if (validators.isNull(user)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID
            });
        }

        const localStatus = getLocalStatus({
            paypalStatus: status
        });
        const payment = await insertPayment({
            userID,
            status: localStatus,
            details,
            timestamp,
            additional,
            paymentCollectionData
        });

        await insertUserLog({
            userID,
            paymentID: payment.getID()
        });

        let paymentData = objectHelpers.transformEntityIntoASimpleObject(payment, [
            "ID",
            "status",
            "timestamp",
            "additional"
        ]);
        return Object.freeze(paymentData);
    }
};

module.exports = addOnetimePremiumPaymentFactory;