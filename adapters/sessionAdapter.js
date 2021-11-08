const session = require("express-session");

const initialize = ({secret, cookieMaxAge}) => {
    return session({
        secret,
        cookie: { maxAge: cookieMaxAge },
        resave: false,
        saveUninitialized: true
    })
};

const get = ({req, key}) => {
    return req.session[key];
};

const set = ({req, key, value}) => {
    req.session[key] = value;
    return true;
};

module.exports = { initialize, get, set };