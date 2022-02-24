const userLogEntity = require("../entities/userLogEntity");
const postEntity = require("../entities/postEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "get posts count use case error: ";

let getPostsCountFactory = (
    {
        validators,
        database,
        RequestError
    }
) => {
    const insertUserLog = async ({userID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Getting user posts count"
        });
        await database.insert({
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

        const countResult = await database.count({
            collectionData: postCollectionData,
            filter,
            sort: {isPinned: -1}
        });

        if (validators.isPopulatedArray(countResult)) {
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
            !database.isID(userID)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID
            });
        }

        const userData = database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user does not exist in the database", {
                userID
            });
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