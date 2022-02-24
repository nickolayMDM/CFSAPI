const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const postEntity = require("../entities/postEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "get searched posts use case validation error: ";

let getSearchedContentFactory = (
    {
        validators,
        database,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, searchQuery}) => {
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
            description: "Getting search contents",
            additional: {
                searchQuery
            }
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

    const findAllFolders = async ({userID, searchQuery}) => {
        const folderCollectionData = folderEntity.getCollectionData();
        const searchRegExp = new RegExp(".*" + searchQuery + ".*", "i");

        let filter = {
            userID,
            isDeleted: false,
            name: searchRegExp
        };

        return await database.findAll({
            collectionData: folderCollectionData,
            filter,
            project: {
                ID: 1,
                name: 1
            }
        });
    };

    const addIsEmptyToFolders = async ({folders, userID}) => {
        if (folders.length < 1) {
            return folders;
        }

        const postCollectionData = postEntity.getCollectionData();
        let folderPostIDToArrayKeyCorrelation = {};
        let folderIDs = folders.reduce((accumulator, value, index) => {
            folders[index].isEmpty = true;
            folderPostIDToArrayKeyCorrelation[value.ID] = index;
            accumulator.push(value.ID);

            return accumulator;
        }, []);

        const postCounts = await database.count({
            collectionData: postCollectionData,
            filter: {
                folderID: {$in: folderIDs},
                isDeleted: false,
                userID
            },
            group: "folderID"
        });

        for (let key in postCounts) {
            if (!validators.isDefined(postCounts[key].ID)) {
                continue;
            }

            const ID = postCounts[key].ID.toString();
            const foldersArrayKey = folderPostIDToArrayKeyCorrelation[ID];
            folders[foldersArrayKey].isEmpty = !validators.isPositiveInt(postCounts[key].count);
        }

        return folders;
    };

    const findAllPosts = async ({userID, searchQuery}) => {
        const postCollectionData = postEntity.getCollectionData();
        const searchRegExp = new RegExp(".*" + searchQuery + ".*", "i");

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

        return await database.findAll({
            collectionData: postCollectionData,
            filter,
            project: {
                ID: 1,
                url: 1,
                name: 1,
                note: 1,
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
            if (validators.isDefined(post.folder) && post.folder.length > 0) {
                post.folder = {
                    ID: post.folder[0]._id,
                    name: post.folder[0].name,
                };
            } else {
                delete post.folder;
            }

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
            !database.isID(userID)
            || !validators.isPopulatedString(searchQuery)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                searchQuery
            });
        }

        if (validators.isStringWithin(searchQuery, 0, 2)) {
            throw new RequestError(errorPrefix + "search query is too short", {
                userID,
                searchQuery
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

        let folders = await findAllFolders({
            userID,
            searchQuery
        });
        //TODO: move addIsEmptyToFolders outside of the use case since it is used more than once
        folders = await addIsEmptyToFolders({
            folders,
            userID
        });

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

        return {
            posts: Object.freeze(posts),
            folders: Object.freeze(folders)
        };
    }
};

module.exports = getSearchedContentFactory;