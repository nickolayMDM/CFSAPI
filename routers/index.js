const userRouter = require("./userRouter");
const folderRouter = require("./folderRouter");
const postRouter = require("./postRouter");
const searchRouter = require("./searchRouter");
const paymentRouter = require("./paymentRouter");

//TODO: transform routes to "{entity}/{action}" format

const initiate = (app) => {
    userRouter(app);
    folderRouter(app);
    postRouter(app);
    searchRouter(app);
    paymentRouter(app);
};

module.exports = initiate;