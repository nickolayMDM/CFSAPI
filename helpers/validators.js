const objectValidators = require("./validators/objectValidators");
const numberValidators = require("./validators/numberValidators");
const restValidators = require("./validators/restValidators");
const stringValidators = require("./validators/stringValidators");
const timeValidators = require("./validators/timeValidators");

const isDefined = (value) => {
    return (typeof value !== "undefined");
};

const isNull = (value) => {
    return (value === null);
};

const isBoolean = (value) => {
    return (typeof value === "boolean");
};

const isFunction = (value) => {
    return typeof value === "function";
};

const isBuffer = (value) => {
    return value instanceof Buffer;
};

module.exports = {
    ...objectValidators,
    ...numberValidators,
    ...restValidators,
    ...stringValidators,
    ...timeValidators,
    isDefined,
    isNull,
    isBoolean,
    isFunction,
    isBuffer
};