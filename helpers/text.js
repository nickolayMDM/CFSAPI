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

const replacePlaceholder = ({body, name, replacement}) => {
    if (typeof body !== "string" || typeof name !== "string") return body;
    if (typeof replacement === "number") {
        replacement = "" + replacement;
    }
    if (Array.isArray(replacement) || validators.isObject(replacement)) {
        replacement = JSON.stringify(replacement);
        replacement = encodeURI(replacement);
    }
    if (typeof replacement !== "string") {
        return body;
    }

    let replaceString = "{" + name + "}";
    return body.replace(replaceString, replacement);
};

const replacePlaceholders = ({body, replacements}) => {
    if (typeof body !== "string" || typeof replacements !== "object") return body;

    for (let key in replacements) {
        if (!replacements.hasOwnProperty(key)) continue;
        let value = replacements[key];

        body = replacePlaceholder({
            body,
            name: key,
            replacement: value
        });
    }

    return body;
};

const trimSpaces = (text) => {
    text = text.trim();
    text = text.replace(/\s\s+/g, " ");

    return text;
};

module.exports = {generateHashFromStringArray, uncapitalizeFirstLetter, replacePlaceholder, replacePlaceholders, trimSpaces};