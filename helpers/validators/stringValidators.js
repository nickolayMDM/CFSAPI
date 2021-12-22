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

const isString = (value) => {
    return typeof value === "string";
};

const isStringWithin = (value, min, max) => {
    return typeof value === "string" && value.length >= min && value.length <= max;
};

module.exports = {
    isCountryCode,
    isEmail,
    isIP,
    isPopulatedString,
    isMD5Hash,
    isJsonString,
    isUrl,
    isString,
    isStringWithin
};