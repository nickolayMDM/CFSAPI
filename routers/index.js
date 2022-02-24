const userRouter = require("./userRouter");
const folderRouter = require("./folderRouter");
const postRouter = require("./postRouter");
const searchRouter = require("./searchRouter");

//TODO: transform routes to "{entity}/{action}" format

const initiate = (app) => {
    userRouter(app);
    folderRouter(app);
    postRouter(app);
    searchRouter(app);
};

module.exports = initiate;