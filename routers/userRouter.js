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

    route.setRoute({
        app,
        path: "/getOwnUser",
        type: "get",
        func: userController.getOwnUser
    });

    route.setRoute({
        app,
        path: "/getUserByPassword",
        type: "get",
        func: userController.getUserByPassword
    });

    route.setRoute({
        app,
        path: "/addPasswordAuthorizationToUser",
        type: "put",
        func: userController.addPasswordAuthorizationToUser
    });

    route.setRoute({
        app,
        path: "/mergeUserWithCurrent",
        type: "put",
        func: userController.mergeUserWithCurrent
    });
};

module.exports = initiate;