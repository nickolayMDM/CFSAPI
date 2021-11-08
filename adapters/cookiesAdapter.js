const nodeCookie = require("node-cookie");

const get = ({req, key}) => {
    return nodeCookie.get(req, key);
};

const set = ({res, key, value}) => {
    nodeCookie.create(res, key, value, {
        path: "/"
    });
    return true;
};

module.exports = { get, set };