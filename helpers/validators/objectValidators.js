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
    return (isObjectType(value) && !Array.isArray(value) && !(value instanceof RegExp) && value !== null);
};

const isRegExp = (value) => {
    return value instanceof RegExp;
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

module.exports = {
    isWithin,
    isArray,
    isEmptyArray,
    isObject,
    isPopulatedObject,
    isPopulatedArray,
    isEmptyObject,
    isObjectType,
    isRegExp
};