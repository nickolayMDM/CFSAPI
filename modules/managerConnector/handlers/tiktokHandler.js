const request = require("../../../adapters/requestAdapter");
const validators = require("../../../helpers/validators");
const config = require("../../../config");

const host = config.managerService.tiktok.host;
const authString = config.managerService.tiktok.authString;

const getPostDetailsFromInput = async (postInput) => {
    const requestResult = await request.post({
        url: host + "getPostDetailsFromInput",
        headers: {
            "app-auth-string": authString
        },
        params: {
            input: postInput
        }
    });

    return requestResult;
};

module.exports = { getPostDetailsFromInput };