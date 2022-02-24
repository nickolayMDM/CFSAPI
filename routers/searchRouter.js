const route = require("../adapters/routeAdapter");
const searchController = require("../controllers/searchController");

const initiate = (app) => {
    route.setRoute({
        app,
        path: "/getSearchedContent",
        type: "get",
        func: searchController.getSearchedContent
    });
};

module.exports = initiate;