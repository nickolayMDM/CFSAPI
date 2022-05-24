const userLogEntity = require("../entities/userLogEntity");
const paymentEntity = require("../entities/paymentEntity");

const errorPrefix = "approve payment use case error: ";

let ApprovePaymentFactory = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, oldPayment}) => {
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
            description: "Approved a payment",
            additional: {
                paymentID: oldPayment.getID(),
                oldStatus: oldPayment.getStatus()
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const approvePayment = async ({oldPayment, paymentCollectionData}) => {
        let paymentData = objectHelpers.transformEntityIntoASimpleObject(oldPayment);
        paymentData.status = paymentEntity.getPaymentStatuses().STATUS_SUCCESS;

        const buildPayment = paymentEntity.buildPaymentFactory({
            validators,
            database
        });
        const payment = buildPayment(paymentData);

        await database.updateEntity({
            collectionData: paymentCollectionData,
            entityData: payment
        });

        return payment;
    };

    const getPayment = async ({paymentID, userID, paymentCollectionData}) => {
        const paymentData = await database.findOne({
            collectionData: paymentCollectionData,
            filter: {
                ID: paymentID,
                userID,
                status: {$in: paymentEntity.getApprovableStatuses()}
            }
        });
        if (validators.isNull(paymentData)) {
            return null;
        }

        const buildPayment = paymentEntity.buildUserFactory({
            validators,
            database
        });
        const payment = buildPayment(paymentData);

        return payment;
    };

    return async (
        {
            paymentID,
            userID
        } = {}
    ) => {
        if (
            !database.isID(paymentID)
            || !database.isID(userID)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                paymentID,
                userID
            });
        }
        const paymentCollectionData = paymentEntity.getCollectionData();

        const oldPayment = await getPayment({paymentID, userID, paymentCollectionData});
        if (validators.isNull(oldPayment)) {
            throw new RequestError(errorPrefix + "payment not found", {
                userID
            });
        }

        const payment = await approvePayment({
            oldPayment,
            paymentCollectionData
        });

        await insertUserLog({
            userID,
            oldPayment
        });

        let paymentData = objectHelpers.transformEntityIntoASimpleObject(payment, [
            "ID",
            "status"
        ]);
        return Object.freeze(paymentData);
    }
};

module.exports = ApprovePaymentFactory;