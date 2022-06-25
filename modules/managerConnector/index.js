const validators = require("../../helpers/validators");

const tiktokHandler = require("./handlers/tiktokHandler");
const youtubeHandler = require("./handlers/youtubeHandler");
const redditHandler = require("./handlers/redditHandler");

const managerHandlers = {
    tiktok: tiktokHandler,
    youtube: youtubeHandler,
    reddit: redditHandler,
};

const getPostDetailsFromInput = async ({postInput, useManagers = []}) => {
    if (!validators.isPopulatedArray(useManagers)) {
        useManagers = Object.keys(managerHandlers);
    }

    useManagers = useManagers.filter(
        (useManagerName) => validators.isDefined(managerHandlers[useManagerName]) && validators.isFunction(managerHandlers[useManagerName].getPostDetailsFromInput)
    );
    //TODO: handle when managers are not active
    //TODO: handle all promises rejected
    const managers = useManagers.map((useManagerName) => {
        return new Promise((resolve, reject) => {
            managerHandlers[useManagerName].getPostDetailsFromInput(postInput)
                .then((value) => {
                    if (!validators.isOkStatus(value.status)) {
                        reject(value.error);
                    }

                    resolve(value);
                })
                .catch((error) => {
                    console.log("catch", error);
                    reject(error);
                })
        });
    });

    return await Promise.any(managers);
};

module.exports = { getPostDetailsFromInput };