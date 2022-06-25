const request = require("../../../adapters/requestAdapter");
const config = require("../../../config");

const host = config.managerService.reddit.host;
const authString = config.managerService.reddit.authString;

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