const addFolderFactory = require("../../useCases/addPost");
const addPostFactory = require("../../useCases/addPost");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");
const post = require("../../entities/postEntity");

const addPostUseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testBefore,
        testThrows,
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        isObject,
        isJsonString,
        isUrl,
        isString,
        generateDatabaseID,
        insertEntityIntoDatabase,
        findOneFromDatabase,
        processPostInput,
        imageProcessorObject,
        transformEntityIntoASimpleObject
    }
) => {
    testDescribe("Add post use case Test", () => {
        const addFolder = addFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            isNull,
            isBoolean,
            generateDatabaseID,
            findOneFromDatabase,
            insertEntityIntoDatabase,
            transformEntityIntoASimpleObject
        });
        const addPost = addPostFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            isNull,
            isBoolean,
            isJsonString,
            isUrl,
            isString,
            generateDatabaseID,
            findOneFromDatabase,
            insertEntityIntoDatabase,
            processPostInput,
            imageProcessorObject,
            transformEntityIntoASimpleObject
        });
        let folderCollectionData, postCollectionData, userCollectionData;

        testBefore(async () => {
            postCollectionData = post.getCollectionData();
            folderCollectionData = folder.getCollectionData();
            userCollectionData = user.getCollectionData();
        });

        testIt("should add a minimal root post", async () => {
            const name = "root post";
            const url = "https://test.web/page/rootPost";
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });
            const postData = await addPost({
                userID,
                name,
                url
            });
            const databasePostData = findOneFromDatabase({
                collectionData: postCollectionData,
                filter: {
                    ID: postData.ID
                }
            });

            testEqual((isObject(databasePostData) && databasePostData.name === name), true, "did not find the post in the database");
        });

        testIt("should add a minimal folder post", async () => {
            const folderName = "post folder";
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });
            const postFolder = await addFolder({
                userID,
                name: folderName
            });

            const name = "folder post";
            const url = "https://test.web/page/folderPost";
            const postData = await addPost({
                userID,
                folderID: postFolder.ID,
                name,
                url
            });
            const databasePostData = findOneFromDatabase({
                collectionData: postCollectionData,
                filter: {
                    ID: postData.ID,
                    folderID: postFolder.ID
                }
            });

            testEqual((isObject(databasePostData) && databasePostData.name === name), true, "did not find the post in the database");
        });
    });
};

module.exports = addPostUseCaseTest;