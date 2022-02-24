const addFolderFactory = require("../../useCases/addFolder");
const addPostFactory = require("../../useCases/addPost");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");
const post = require("../../entities/postEntity");

const addPostUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        processPostInput,
        imageProcessorObject,
        RequestError
    }
) => {
    test.describe("Add post use case test", () => {
        const addFolder = addFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const addPost = addPostFactory({
            validators,
            database,
            processPostInput,
            imageProcessorObject,
            objectHelpers,
            RequestError
        });
        const postCollectionData = post.getCollectionData();
        const userCollectionData = user.getCollectionData();
        const folderCollectionData = folder.getCollectionData();

        test.before();

        test.it("should add a minimal root post", async () => {
            const name = "post";
            const url = "https://test.web/page/rootPost";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const postData = await addPost({
                userID,
                name,
                url
            });
            const databasePostData = database.findOne({
                collectionData: postCollectionData,
                filter: {
                    ID: postData.ID
                }
            });

            test.equal((validators.isObject(databasePostData) && databasePostData.name === name), true, "did not find the post in the database");
        });

        test.it("should add a minimal folder post", async () => {
            const folderName = "post";
            const userID = database.generateID({
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
            const databasePostData = database.findOne({
                collectionData: postCollectionData,
                filter: {
                    ID: postData.ID,
                    folderID: postFolder.ID
                }
            });

            test.equal((validators.isObject(databasePostData) && databasePostData.name === name), true, "did not find the post in the database");
        });

        test.it("should throw an error with a folder ID of a non-existent folder", async () => {
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const folderID = database.generateID({
                collectionName: folderCollectionData.name
            });

            const name = "folder post with error";
            const url = "https://test.web/page/folderPostWithError";

            await test.rejects(addPost({
                userID,
                folderID,
                name,
                url
            }), RequestError, "Did not receive an error when trying to add a post with a folder ID of a non-existent folder");
        });

        test.it("should throw an error with an existing name", async () => {
            const name = "existing name post";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            const firstUrl = "https://test.web/page/existingNamePost1";

            await addPost({
                userID,
                name,
                url: firstUrl
            });

            const secondUrl = "https://test.web/page/existingNamePost2";

            await test.rejects(addPost({
                userID,
                name,
                url: secondUrl
            }), RequestError, "Did not receive an error when trying to add a post with an existing name");
        });

        test.it("should throw an error with an existing url", async () => {
            const url = "https://test.web/page/existingUrlPost";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            const firstName = "existing url post 1";

            await addPost({
                userID,
                name: firstName,
                url
            });

            const secondName = "existing url post 2";

            await test.rejects(addPost({
                userID,
                name: secondName,
                url
            }), RequestError, "Did not receive an error when trying to add a post with an existing url");
        });

        test.it("should throw an error without a user ID", async () => {
            const name = "post1";
            const url = "https://test.web/page/post1";

            await test.rejects(addPost({
                name,
                url
            }), RequestError, "Did not receive an error when trying to add a post without a user ID");
        });
        test.it("should throw an error with a user ID that is not an ID type", async () => {
            const name = "post2";
            const url = "https://test.web/page/post2";
            const userID = "Bob";

            await test.rejects(addPost({
                name,
                url,
                userID
            }), RequestError, "Did not receive an error when trying to add a post with a user ID that is not an ID type");
        });

        test.it("should throw an error without a name", async () => {
            const url = "https://test.web/page/post3";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            await test.rejects(addPost({
                url,
                userID
            }), RequestError, "Did not receive an error when trying to add a post without a name");
        });
        test.it("should throw an error with a name that is not a string", async () => {
            const name = {};
            const url = "https://test.web/page/post4";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            await test.rejects(addPost({
                name,
                url,
                userID
            }), RequestError, "Did not receive an error when trying to add a post with a name that is not a string");
        });

        test.it("should throw an error without a url", async () => {
            const name = "post5";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            await test.rejects(addPost({
                name,
                userID
            }), RequestError, "Did not receive an error when trying to add a post without a name");
        });
        test.it("should throw an error with a url value that is not an actual url", async () => {
            const name = "post6";
            const url = "Bob";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            await test.rejects(addPost({
                name,
                url,
                userID
            }), RequestError, "Did not receive an error when trying to add a post with a url value that is not an actual url");
        });
    });
};

module.exports = addPostUseCaseTest;