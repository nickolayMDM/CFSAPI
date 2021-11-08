const test = require("../adapters/testAdapter");
const userCookieGenerator = require("../adapters/userCookieGeneratorAdapter");
const validators = require("../helpers/validators");
const database = require("../adapters/databaseAdapter");

const folders = [
    "entities",
    "useCases"
];

for (let key in folders) {
    if (!folders.hasOwnProperty(key)) continue;

    const runFolderTests = require("./" + folders[key]);

    runFolderTests({
        testDescribe: test.describe,
        testBeforeEach: test.beforeEach,
        testIt: test.it,
        testEqual: test.equal,
        testThrows: test.throws,
        testBefore: test.before,
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isNonNegativeInteger: validators.isNonNegativeInteger,
        isWithin: validators.isWithin,
        isID: database.isID,
        isIP: validators.isIP,
        isCountryCode: validators.isCountryCode,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isBoolean: validators.isBoolean,
        isMD5Hash: validators.isMD5Hash,
        isJsonString: validators.isJsonString,
        isUrl: validators.isUrl,
        isInt: validators.isInt,
        isTimestamp: validators.isTimestamp,
        isCookie: userCookieGenerator.isCookie,
        generateDatabaseID: database.generateID,
        generateUserCookie: userCookieGenerator.generateUserCookie,
    });
}