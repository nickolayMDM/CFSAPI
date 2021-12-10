//TODO: break up into validator categories for readability
const isDefined = (value) => {
    return (typeof value !== "undefined");
};

const isNull = (value) => {
    return (value === null);
};

const isCountryCode = (value) => {
    const regularExpression = /^[a-z]{2}$/;
    return regularExpression.test(String(value));
};

const isEmail = (value) => {
    const regularExpression = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regularExpression.test(String(value).toLowerCase());
};

const isIP = (value) => {
    const regularExpression = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regularExpression.test(String(value));
};

const isPopulatedString = (value) => {
    return (typeof value === "string" && value.length > 0);
};

const isNonNegativeInteger = (value) => {
    return (Number.isInteger(value) && value >= 0);
};

const isWithin = (needle, haystack) => {
    return (haystack.indexOf(needle) > -1);
};

const isArray = (value) => {
    return (Array.isArray(value));
};

const isEmptyArray = (value) => {
    return (Array.isArray(value) && value.length <= 0);
};

const isObject = (value) => {
    return (isObjectType(value) && !Array.isArray(value) && value !== null);
};

const isPopulatedObject = (value) => {
    return (isObjectType(value) && !Array.isArray(value) && Object.keys(value).length > 0);
};

const isPopulatedArray = (value) => {
    return (isArray(value) && value.length > 0);
};

const isEmptyObject = (value) => {
    return (isObjectType(value) && !Array.isArray(value) && Object.keys(value).length === 0);
};

const isObjectType = (value) => {
    return (typeof value === "object");
};

const isBoolean = (value) => {
    return (typeof value === "boolean");
};

const isMD5Hash = (value) => {
    const regularExpression = /^[a-f0-9]{32}$/;
    return regularExpression.test(String(value));
};

const isJsonString = (value) => {
    try {
        let object = JSON.parse(value);

        if (object && typeof object === "object") {
            return true;
        }
    } catch (e) {
    }

    return false;
};

const isUrl = (value) => {
    let url;

    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
};

const isInt = (value) => {
    return Number.isInteger(value);
};

const isPositiveInt = (value) => {
    return Number.isInteger(value) && value > 0;
};

const isTimestamp = (value) => {
    const newTimestamp = new Date(value).getTime();
    return isNumeric(newTimestamp);
};

const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

const isFunction = (value) => {
    return typeof value === "function";
};

const isString = (value) => {
    return typeof value === "string";
};

const isStringWithin = (value, min, max) => {
    return typeof value === "string" && value.length >= min && value.length <= max;
};

const isOkStatus = (value) => {
    return (isInt(value) && value >= 200 && value < 300);
};

const isBuffer = (value) => {
    return value instanceof Buffer;
};

module.exports = {
    isDefined,
    isCountryCode,
    isEmail,
    isIP,
    isPopulatedString,
    isArray,
    isObject,
    isObjectType,
    isNonNegativeInteger,
    isWithin,
    isNull,
    isPopulatedObject,
    isBoolean,
    isMD5Hash,
    isJsonString,
    isUrl,
    isInt,
    isTimestamp,
    isNumeric,
    isEmptyObject,
    isFunction,
    isEmptyArray,
    isString,
    isPopulatedArray,
    isOkStatus,
    isBuffer,
    isPositiveInt,
    isStringWithin
};