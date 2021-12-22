const md5 = require("md5");
const validators = require("../../helpers/validators");
const deviceDetector = require('node-device-detector');
const salt = "321e5d8676b32781c12d85eedf048b35";

//TODO: initialize function for injecting database functions; use database.isID validator

const _splitCookieValue = (value) => {
    if (typeof value !== "string") {
        return null;
    }

    return value.split(",");
};

const _generateCookieHashValue = async ({deviceData, userID, deviceString}) => {
    const deviceSlug = deviceData.os["short_name"] + deviceData.os["platform"] + deviceData.os["family"]
        + deviceData.client["type"] + deviceData.client["short_name"] + deviceData.client["family"]
        + deviceData.device["id"] + deviceData.device["type"] + deviceData.device["model"];
    //TODO: maybe use a different encryption method here
    return md5(deviceSlug + deviceString + userID + salt);
};

const _getDeviceValueDetails = ({deviceValue}) => {
    const detector = new deviceDetector();
    const result = detector.detect(deviceValue);

    return result;
};

const generateUserCookie = async ({deviceValue, IP, userID, deviceString}) => {
    const deviceData = _getDeviceValueDetails({
        deviceValue
    });

    const cookieHashValue = await _generateCookieHashValue({
        deviceData,
        userID,
        IP,
        deviceString
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