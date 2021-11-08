const userRouter = require("./userRouter");
const folderRouter = require("./folderRouter");
const postRouter = require("./postRouter");

//TODO: transform routes to "{entity}/{action}" format

const initiate = (app) => {
    userRouter(app);
    folderRouter(app);
    postRouter(app);
};

module.exports = initiate;