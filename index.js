const express = require("express");
const session = require("./adapters/sessionAdapter");
const initializeRoutes = require("./routers");
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require("./config");

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

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});