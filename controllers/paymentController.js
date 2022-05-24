const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const httpHelpers = require("../helpers/http");
const objectHelpers = require("../helpers/object");
const debug = require("../adapters/debugAdapter");
const addOnetimePremiumPaymentFactory = require("../useCases/addOnetimePremiumPayment");
const approvePaymentFactory = require("../useCases/approvePayment");
const denyPaymentFactory = require("../useCases/denyPayment");
const RequestError = require("../errors/RequestError");

const addOnetimePremiumPayment = async (req, res) => {
    const status = httpHelpers.getParamFromRequest(req, "status");
    const details = httpHelpers.getParamFromRequest(req, "details");
    const sessionUserID = req.currentUserID;

    const addOnetimePremiumPayment = addOnetimePremiumPaymentFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    let payment;
    try {
        payment = await addOnetimePremiumPayment({
            userID: sessionUserID,
            status,
            details
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        payment
    });
};

const approvePayment = async (req, res) => {
    const paymentID = httpHelpers.getParamFromRequest(req, "paymentID");
    const sessionUserID = req.currentUserID;

    const approvePayment = approvePaymentFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    let payment;
    try {
        payment = await approvePayment({
            userID: sessionUserID,
            paymentID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        payment
    });
};

const denyPayment = async (req, res) => {
    const paymentID = httpHelpers.getParamFromRequest(req, "paymentID");
    const sessionUserID = req.currentUserID;

    const denyPayment = denyPaymentFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    let payment;
    try {
        payment = await denyPayment({
            userID: sessionUserID,
            paymentID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        payment
    });
};

module.exports = {
    addOnetimePremiumPayment,
    approvePayment,
    denyPayment
};