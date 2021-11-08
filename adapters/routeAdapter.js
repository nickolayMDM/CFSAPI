const express = require('express');

const setRoute = ({app, path = "*", type = "all", func} = {}) => {
    return app[type](path, async (req, res, next) => {
        await func(req, res, next);
    });
};

module.exports = { setRoute };