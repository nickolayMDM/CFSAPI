const express = require("express");
const http = require("http");
const https = require("https");
const session = require("./adapters/sessionAdapter");
const database = require("./adapters/databaseAdapter");
const file = require("./adapters/fileAdapter");
const debug = require("./adapters/debugAdapter");
const validators = require("./helpers/validators");
const initializeRoutes = require("./routers");
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require("./config");
const serverLogEntity = require("./entities/serverLogEntity");

debug.initialize({
    databaseAdapter: database,
    serverLogEntity: serverLogEntity,
    validators: validators
});

const app = express();
const port = config.port;

// app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(session.initialize({
    secret: "3b1ef817f38cdf2df58326ac02603085",
    cookie: {
        maxAge: 60000
    }
}));
initializeRoutes(app);

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`App listening as http:${port}`);
});