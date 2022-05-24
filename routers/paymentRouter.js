const route = require("../adapters/routeAdapter");
const paymentController = require("../controllers/paymentController");

const initiate = (app) => {
    route.setRoute({
        app,
        path: "/addOnetimePremiumPayment",
        type: "post",
        func: paymentController.addOnetimePremiumPayment
    });

    route.setRoute({
        app,
        path: "/approvePayment",
        type: "put",
        func: paymentController.approvePayment
    });

    route.setRoute({
        app,
        path: "/denyPayment",
        type: "put",
        func: paymentController.denyPayment
    });
};

module.exports = initiate;