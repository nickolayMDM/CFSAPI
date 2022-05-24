const validators = require("./validators");

const getNameFromUserAgent = (userAgent) => {
    let browserDataMatches = [...userAgent.matchAll(/ ([a-zA-Z\d]+?)\//g)];
    let result = browserDataMatches.reduce((accumulator, value) => {
        if (typeof value[1] === "undefined") {
            return accumulator;
        }

        return accumulator + value[1];
    }, "");

    return result;
};

const getUserAgentFromRequest = (req) => {
    return req.headers["user-agent"];
};

const getIPFromRequest = (req) => {
    return req.connection.remoteAddress;
};

const getParamFromRequest = (req, key) => {
    if (validators.isDefined(req.body)) {
        return req.body[key];
    }
    if (validators.isDefined(req.query)) {
        return req.query[key];
    }

    return null;
};

module.exports = { getNameFromUserAgent, getUserAgentFromRequest, getIPFromRequest, getParamFromRequest };