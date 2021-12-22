const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");

const errorPrefix = "folder entity validation error: ";

let getSearchedPostsFactory = (
    {
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        findAllFromDatabase,
        insertIntoDatabase
    }
) => {
    const insertUserLog = async ({userID, searchQuery}) => {
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
            description: "Getting search contents",
            additional: {
                searchQuery
            }
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

    const findAllPosts = async ({userID, searchQuery}) => {
        const postCollectionData = postEntity.getCollectionData();
        const searchRegExp = new RegExp(".*" + searchQuery + ".*");

        //TODO: this filter is closely tied to MongoDB; needs to be generalized
        let filter = {
            userID,
            isDeleted: false,
            $or: [
                {name: searchRegExp},
                {note: searchRegExp},
                {author: searchRegExp}
            ]
        };

        return await findAllFromDatabase({
            collectionData: postCollectionData,
            filter,
            project: {
                ID: 1,
                url: 1,
                name: 1,
                note: 1,
                isPinned: 1,
                folderID: 1,
                author: 1,
                folder: 1,
            },
            join: [
                {
                    collectionData: folderEntity.getCollectionData(),
                    masterField: "folderID",
                    fromField: "ID",
                    outputKey: "folder"
                }
            ]
        });
    };

    const transformPosts = ({posts}) => {
        return posts.map((post) => {
            post.folder = {
                ID: post.folder[0]._id,
                name: post.folder[0].name,
            };

            return post;
        });
    };

    return async (
        {
            userID,
            searchQuery
        } = {}
    ) => {
        if (
            !isID(userID)
            || !isPopulatedString(searchQuery)
        ) {
            throw new TypeError(errorPrefix + "invalid data passed");
        }

        let posts = await findAllPosts({
            userID,
            searchQuery
        });
        posts = transformPosts({
            posts
        });

        await insertUserLog({
            userID,
            searchQuery
        });

        return Object.freeze(posts);
    }
};

module.exports = getSearchedPostsFactory;