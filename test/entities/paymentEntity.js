const payment = require("../../entities/paymentEntity");
const user = require("../../entities/userEntity");

const paymentTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("Payment Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: payment.getCollectionData
        });

        const buildPayment = payment.buildPaymentFactory({
            validators,
            database
        });
        const paymentTypes = payment.getPaymentTypes();
        const paymentReasons = payment.getPaymentReasons();
        const paymentStatuses = payment.getPaymentStatuses();
        const paymentCollectionData = payment.getCollectionData();
        const timestamp = Date.now();
        const objectMock = {
            mock: "data"
        };
        const ID = database.generateID({
            collectionName: paymentCollectionData.name
        });
        const consistentBuildParameters = {
            userID: database.generateID({
                collectionName: user.getCollectionData().name
            })
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should build a correct entity",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });

        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...consistentBuildParameters,
                ID: "Bob",
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity without a user ID",
            buildParameters: {
                ID,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect user ID",
            buildParameters: {
                ID,
                userID: "Bob",
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity without a type",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect type",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: "Bob",
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity without a reason",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect reason",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: "Bob",
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect status",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect timestamp data type",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                timestamp: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect details data type",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                details: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildPayment,
            testName: "should throw an error when building an entity with an incorrect additional data type",
            buildParameters: {
                ID,
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                additional: "Bob"
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get user ID from entity",
            expectedData: consistentBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get type from entity",
            expectedData: paymentTypes.TYPE_ONETIME,
            getFunctionName: "getType",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get reason from entity",
            expectedData: paymentReasons.REASON_PREMIUM,
            getFunctionName: "getReason",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get status from entity",
            expectedData: paymentStatuses.STATUS_PENDING,
            getFunctionName: "getStatus",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get timestamp from entity",
            expectedData: timestamp,
            getFunctionName: "getTimestamp",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                timestamp
            }
        });
        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should throw an error when getting undefined details from entity",
            getFunctionName: "getDetails",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get details from entity",
            expectedData: objectMock,
            getFunctionName: "getDetails",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                details: objectMock
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildPayment,
            testName: "should get additional from entity",
            expectedData: objectMock,
            getFunctionName: "getAdditional",
            buildParameters: {
                ...consistentBuildParameters,
                type: paymentTypes.TYPE_ONETIME,
                reason: paymentReasons.REASON_PREMIUM,
                status: paymentStatuses.STATUS_PENDING,
                additional: objectMock
            }
        });

        test.it("should receive payment types object", () => {
            const statuses = payment.getPaymentTypes();

            test.equal(typeof statuses, "object", "Failed to get the correct object");
        });
        test.it("should receive payment reasons object", () => {
            const statuses = payment.getPaymentReasons();

            test.equal(typeof statuses, "object", "Failed to get the correct object");
        });
        test.it("should receive payment statuses object", () => {
            const statuses = payment.getPaymentStatuses();

            test.equal(typeof statuses, "object", "Failed to get the correct object");
        });
    });
};

module.exports = paymentTest;