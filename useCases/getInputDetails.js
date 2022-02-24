const userLog = require("../entities/userLogEntity");
const user = require("../entities/userEntity");

const errorPrefix = "get input details use case error: ";

let getInputDetailsFactory = (
    {
        validators,
        database,
        processPostInput,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, postInput, post}) => {
        const userLogCollectionData = userLog.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLog.buildUserLogFactory({
            validators,
            database
        });
        const userLogEntity = buildUserLog({
            ID: userLogID,
            userID,
            description: "Getting input details",
            additional: {
                postInput,
                post
            }
        });
        await database.insert({
            collectionData: userLogCollectionData,
            entityData: {
                ID: userLogEntity.getID(),
                userID: userLogEntity.getUserID(),
                description: userLogEntity.getDescription(),
                additional: userLogEntity.getAdditional(),
                timestamp: userLogEntity.getTimestamp()
            }
        });
    };

    return async (
        {
            userID,
            postInput
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !validators.isPopulatedString(postInput)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                postInput
            });
        }

        const userData = await database.findOne({
            collectionData: user.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user was not found in the database", {
                userID
            });
        }

        const processPostInputResult = await processPostInput({
            postInput
        });
        const post = processPostInputResult.response.postDetails;

        await insertUserLog({
            postInput,
            post,
            userID
        });

        return post;
    }
};

module.exports = getInputDetailsFactory;