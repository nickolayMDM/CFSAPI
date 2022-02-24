const test = require("../adapters/testAdapter");
const userCookieGenerator = require("../adapters/userCookieGeneratorAdapter");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const database = require("../adapters/databaseAdapter");
const hashing = require("../adapters/hashingAdapter");
const managerConnector = require("../adapters/managerConnectorAdapter");
const imageFileAdapter = require("../adapters/fileAdapters/imageFileAdapter");
const RequestError = require("../errors/RequestError");

const folders = [
    "entities",
    "useCases"
];

for (let key in folders) {
    if (!folders.hasOwnProperty(key)) continue;

    const runFolderTests = require("./" + folders[key]);

    runFolderTests({
        test,
        validators,
        database,
        userCookieGenerator,
        objectHelpers,
        managerConnector,
        hashing,
        imageProcessorObject: imageFileAdapter,
        RequestError
    });
}