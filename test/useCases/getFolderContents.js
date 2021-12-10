const getFolderContentsFactory = require("../../useCases/getFolderContents");
const userEntity = require("../../entities/userEntity");
const folderEntity = require("../../entities/folderEntity");
const postEntity = require("../../entities/postEntity");

const getFolderContentsUseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        testBefore,
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isBoolean,
        isNull,
        insertIntoDatabase,
        generateDatabaseID,
        findAllFromDatabase,
        findOneFromDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    testDescribe("Get folder contents use case test", () => {
        const getFolderContents = getFolderContentsFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            isBoolean,
            isNull,
            generateDatabaseID,
            findAllFromDatabase,
            findOneFromDatabase,
            insertIntoDatabase,
            transformEntityIntoASimpleObject
        });
        const userCollectionData = userEntity.getCollectionData();
        const folderCollectionData = folderEntity.getCollectionData();
        const postCollectionData = postEntity.getCollectionData();
        const user = {
            ID: generateDatabaseID({collectionName: userCollectionData.name}),
            name: "Bob",
            email: "bobsemail@fake.mail",
            status: "guest"
        };
        const folder = {
            ID: generateDatabaseID({collectionName: folderCollectionData.name}),
            userID: user.ID,
            name: "Bob's folder",
            isDeleted: false
        };
        const otherFolder = {
            ID: generateDatabaseID({collectionName: folderCollectionData.name}),
            userID: user.ID,
            name: "Bob's other folder",
            isDeleted: false
        };
        const post = {
            ID: generateDatabaseID({collectionName: postCollectionData.name}),
            userID: user.ID,
            folderID: folder.ID,
            isDeleted: false
        };
        const otherFolderPost = {
            ID: generateDatabaseID({collectionName: postCollectionData.name}),
            userID: user.ID,
            folderID: otherFolder.ID,
            isDeleted: false
        };

        let rootContents, folderContents;

        testBefore(async () => {
            insertIntoDatabase({
                collectionData: folderCollectionData,
                data: otherFolder
            });
            insertIntoDatabase({
                collectionData: postCollectionData,
                data: otherFolderPost
            });
            insertIntoDatabase({
                collectionData: userCollectionData,
                data: user
            });
            insertIntoDatabase({
                collectionData: folderCollectionData,
                data: folder
            });
            insertIntoDatabase({
                collectionData: postCollectionData,
                data: post
            });

            rootContents = await getFolderContents({
                userID: user.ID
            });
            folderContents = await getFolderContents({
                userID: user.ID,
                folderID: folder.ID
            });
        });

        testIt("should get 2 user's root folders", async () => {
            testEqual(rootContents.folders.length, 2, "Did not find correct data");
        });

        testIt("should get 0 user's root posts", async () => {
            testEqual(rootContents.posts.length, 0, "Did not find correct data");
        });

        testIt("should get no folders in the user's folder", async () => {
            testEqual(folderContents.folders.length, 0, "Did not find correct data");
        });

        testIt("should get user's folder post", async () => {
            testEqual(folderContents.posts[0].ID, post.ID, "Did not find correct data");
        });

        testIt("should throw an error without a user ID", async () => {
            testThrows(getFolderContents, Error, "Did not receive an error when trying to get folder contents without a user ID", true);
        });
    });
};

module.exports = getFolderContentsUseCaseTest;