const md5 = require("md5");
const validators = require("../../helpers/validators");
const geolocation = require("../../adapters/geolocationAdapter");
const salt = "321e5d8676b32781c12d85eedf048b35";

//TODO: initialize function for injecting database functions; use database.isID validator

const _splitCookieValue = (value) => {
    if (typeof value !== "string") {
        return null;
    }

    return value.split(",");
};

const _generateCookieHashValue = async ({deviceValue, IP, userID}) => {
    const geolocationData = await geolocation.getDataByIp(IP);
    return md5(deviceValue + geolocationData.geoplugin_countryCode + geolocationData.geoplugin_regionCode + geolocationData.geoplugin_city + userID + salt);
};

const generateUserCookie = async ({deviceValue, IP, userID}) => {
    const cookieHashValue = await _generateCookieHashValue({
        deviceValue,
        userID,
        IP
    });

    return cookieHashValue + "," + userID;
};

const getValidatedUserID = async ({cookieValue, deviceValue, IP}) => {
    const parsedCookieValue = parseUserCookie(cookieValue);
    if (validators.isNull(parsedCookieValue)) {
        return null;
    }
    const userID = parsedCookieValue[1];

    const testCookieValue = await generateUserCookie({
        deviceValue,
        IP,
        userID
    });

    if (testCookieValue === cookieValue) {
        return userID;
    }

    return null;
};

const parseUserCookie = (value) => {
    const valueArray = _splitCookieValue(value);
    if (!isCookie(valueArray)) {
        return null;
    }

    return {
        hash: valueArray[0],
        userID: valueArray[1]
    };
};

const isCookie = (value) => {
    let valueArray;
    if (typeof value !== "string" && !validators.isArray(value)) {
        return false;
    }

    if (typeof value === "string") {
        valueArray = _splitCookieValue(value);
    }
    if (validators.isArray(value)) {
        valueArray = value;
    }

    return (
        valueArray.length === 2
        && validators.isMD5Hash(valueArray[0])
        && validators.isPopulatedString(valueArray[1])
    );
};

module.exports = { generateUserCookie, isCookie, parseUserCookie, getValidatedUserID };