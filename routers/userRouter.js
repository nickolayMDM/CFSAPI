const route = require("../adapters/routeAdapter");
const userController = require("../controllers/userController");

const initiate = (app) => {
    route.setRoute({
        app,
        func: userController.authorizeMiddleware
    });
    route.setRoute({
        app,
        func: userController.setRequestUserMiddleware
    });

    route.setRoute({
        app,
        path: "/authorize",
        type: "get",
        func: userController.authorize
    });
};

module.exports = initiate;