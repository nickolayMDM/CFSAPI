const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "get posts count use case error: ";

let getPostsCountFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isPopulatedArray,
        generateDatabaseID,
        countInDatabase,
        insertIntoDatabase
    }
) => {
    const insertUserLog = async ({userID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Getting user posts count"
        });
        await insertIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: {
                ID: userLog.getID(),
                userID: userLog.getUserID(),
                description: userLog.getDescription(),
                timestamp: userLog.getTimestamp()
            }
        });
    };

    const countAllPosts = async ({userID}) => {
        const postCollectionData = postEntity.getCollectionData();

        let filter = {
            userID,
            isDeleted: false
        };

        const countResult = await countInDatabase({
            collectionData: postCollectionData,
            filter,
            sort: {isPinned: -1}
        });

        if (isPopulatedArray(countResult)) {
            return countResult[0].count
        }
        return 0;
    };

    return async (
        {
            userID
        } = {}
    ) => {
        if (
            !isID(userID)
        ) {
            throw new TypeError(errorPrefix + "invalid data passed");
        }
        let postsCount = await countAllPosts({
            userID
        });

        await insertUserLog({
            userID
        });

        return postsCount;
    }
};

module.exports = getPostsCountFactory;