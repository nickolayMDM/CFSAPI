const md5 = require("md5");

const generateHashFromStringArray = (stringArray) => {
    let string = stringArray.reduce((accumulator, value) => {
        return accumulator + value;
    }, "");

    return md5(string);
};

const uncapitalizeFirstLetter = (string) => {
    return string.charAt(0).toLowerCase() + string.slice(1);
};

module.exports = { generateHashFromStringArray, uncapitalizeFirstLetter };