const errorPrefix = "get input details use case error: ";

let getInputDetailsFactory = (
    {
        isID,
        isPopulatedString,
        processPostInput
    }
) => {
    //TODO: add logging

    // const insertUserLog = async ({userID}) => {
    //     const userLogCollectionData = userLogEntity.getCollectionData();
    //     const userLogID = generateDatabaseID({
    //         collectionName: userLogCollectionData.name
    //     });
    //     const buildUserLog = userLogEntity.buildUserLogFactory({
    //         isDefined,
    //         isID,
    //         isPopulatedString,
    //         isPopulatedObject,
    //         isTimestamp
    //     });
    //     const userLog = buildUserLog({
    //         ID: userLogID,
    //         userID,
    //         description: "Getting user posts count"
    //     });
    //     await insertIntoDatabase({
    //         collectionData: userLogCollectionData,
    //         entityData: {
    //             ID: userLog.getID(),
    //             userID: userLog.getUserID(),
    //             description: userLog.getDescription(),
    //             timestamp: userLog.getTimestamp()
    //         }
    //     });
    // };

    return async (
        {
            userID,
            postInput
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isPopulatedString(postInput)
        ) {
            throw new TypeError(errorPrefix + "invalid data passed");
        }
        const processPostInputResult = await processPostInput({
            postInput
        });
        const post = processPostInputResult.response.postDetails;

        return post;
    }
};

module.exports = getInputDetailsFactory;