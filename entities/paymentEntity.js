const errorPrefix = "payment entity validation error: ";
const collectionName = "payments";

const TYPE_ONETIME = "onetime";
const TYPE_SUBSCRIPTION = "subscription";
const AVAILABLE_TYPES = [
    TYPE_ONETIME,
    TYPE_SUBSCRIPTION
];

const REASON_PREMIUM = "premium";
const REASON_DONATION = "donation";
const AVAILABLE_REASONS = [
    REASON_PREMIUM,
    REASON_DONATION
];

const STATUS_PENDING = "pending";
const STATUS_SUCCESS = "success";
const STATUS_REVERSED = "reversed";
const STATUS_FAILED = "failed";
const AVAILABLE_STATUSES = [
    STATUS_PENDING,
    STATUS_SUCCESS,
    STATUS_REVERSED,
    STATUS_FAILED
];

const buildPaymentFactory = (
    {
        database,
        validators
    }
) => {
    return (
        {
            ID,
            userID,
            type,
            reason,
            status = STATUS_PENDING,
            timestamp = Date.now(),
            details,
            additional
        } = {}
    ) => {
        let paymentObject = {
            getID: () => ID,
            getUserID: () => userID,
            getType: () => type,
            getReason: () => reason,
            getStatus: () => status,
            getTimestamp: () => timestamp
        };

        if (!database.isID(ID)) {
            throw new Error(errorPrefix + "ID value must be a valid identifier.");
        }

        if (!database.isID(userID)) {
            throw new Error(errorPrefix + "user ID value must be a valid identifier.");
        }

        if (!validators.isWithin(type, AVAILABLE_TYPES)) {
            throw new Error(errorPrefix + "wrong type value.");
        }

        if (!validators.isWithin(reason, AVAILABLE_REASONS)) {
            throw new Error(errorPrefix + "wrong reason value.");
        }

        if (!validators.isWithin(status, AVAILABLE_STATUSES)) {
            throw new Error(errorPrefix + "wrong status value.");
        }

        if (!validators.isTimestamp(timestamp)) {
            throw new Error(errorPrefix + "timestamp has an invalid value.");
        }

        if (validators.isDefined(details)) {
            if (!validators.isPopulatedObject(details)) {
                throw new Error(errorPrefix + "details data has to be an non-empty object.");
            }

            paymentObject.getDetails = () => details;
        }

        if (validators.isDefined(additional)) {
            if (!validators.isPopulatedObject(additional)) {
                throw new Error(errorPrefix + "additional data has to be an non-empty object.");
            }

            paymentObject.getAdditional = () => additional;
        }

        return Object.freeze(paymentObject);
    }
};

const getCollectionData = () => {
    return {
        name: collectionName
    };
};

const getPaymentTypes = () => {
    let resultObject = {};
    resultObject.TYPE_ONETIME = TYPE_ONETIME;
    resultObject.TYPE_SUBSCRIPTION = TYPE_SUBSCRIPTION;

    return resultObject;
};

const getPaymentReasons = () => {
    let resultObject = {};
    resultObject.REASON_PREMIUM = REASON_PREMIUM;
    resultObject.REASON_DONATION = REASON_DONATION;

    return resultObject;
};

const getPaymentStatuses = () => {
    let resultObject = {};
    resultObject.STATUS_PENDING = STATUS_PENDING;
    resultObject.STATUS_SUCCESS = STATUS_SUCCESS;
    resultObject.STATUS_REVERSED = STATUS_REVERSED;
    resultObject.STATUS_FAILED = STATUS_FAILED;

    return resultObject;
};

const getApprovableStatuses = () => {
    let resultObject = {};
    resultObject.STATUS_PENDING = STATUS_PENDING;

    return resultObject;
};

const getDeniableStatuses = () => {
    let resultObject = {};
    resultObject.STATUS_PENDING = STATUS_PENDING;

    return resultObject;
};

module.exports = {
    buildPaymentFactory,
    getCollectionData,
    getPaymentTypes,
    getPaymentReasons,
    getPaymentStatuses,
    getApprovableStatuses,
    getDeniableStatuses
};