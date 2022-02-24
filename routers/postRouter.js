const route = require("../adapters/routeAdapter");
const postController = require("../controllers/postController");

const initiate = (app) => {
    route.setRoute({
        app,
        path: "/getInputDetails",
        type: "get",
        func: postController.getInputDetails
    });

    route.setRoute({
        app,
        path: "/addPost",
        type: "post",
        func: postController.add
    });

    route.setRoute({
        app,
        path: "/renamePost",
        type: "put",
        func: postController.rename
    });

    route.setRoute({
        app,
        path: "/movePost",
        type: "put",
        func: postController.move
    });

    route.setRoute({
        app,
        path: "/deletePost",
        type: "delete",
        func: postController.remove
    });

    route.setRoute({
        app,
        path: "/setPostPin",
        type: "put",
        func: postController.changePinStatus
    });

    route.setRoute({
        app,
        path: "/setPostNote",
        type: "put",
        func: postController.setNote
    });
};

module.exports = initiate;