const route = require("../adapters/routeAdapter");
const folderController = require("../controllers/folderController");

const initiate = (app) => {
    route.setRoute({
        app,
        path: "/getFolderContents",
        type: "get",
        func: folderController.getContents
    });

    route.setRoute({
        app,
        path: "/postFolder",
        type: "post",
        func: folderController.post
    });

    route.setRoute({
        app,
        path: "/renameFolder",
        type: "put",
        func: folderController.rename
    });

    route.setRoute({
        app,
        path: "/moveFolder",
        type: "put",
        func: folderController.move
    });

    route.setRoute({
        app,
        path: "/deleteFolder",
        type: "delete",
        func: folderController.remove
    });

    route.setRoute({
        app,
        path: "/setFolderPin",
        type: "put",
        func: folderController.changePinStatus
    });

    route.setRoute({
        app,
        path: "/getSimpleFolderTree",
        type: "get",
        func: folderController.getSimpleFolderTree
    });
};

module.exports = initiate;