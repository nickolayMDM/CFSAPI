const changePostPinStatusFactory = require("../../useCases/changePostPinStatus");
const addPostFactory = require("../../useCases/addPost");
const user = require("../../entities/userEntity");
const post = require("../../entities/postEntity");

const changePostPinStatusUseCaseTest = (
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
    test.describe("Change post pin status use case test", () => {
        const addPost = addPostFactory({
            validators,
            database,
            objectHelpers,
            processPostInput,
            imageProcessorObject,
            RequestError
        });
        const changePostPinStatus = changePostPinStatusFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        let postEntity, userID;

        test.before(async () => {
            userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            postEntity = await addPost({
                name: "post",
                url: "https://test.web/page/post",
                userID
            });
        });

        test.it("should pin the post", async () => {
            const postData = await changePostPinStatus({
                userID,
                postID: postEntity.ID,
                isPinned: true
            });
            const databasePostData = database.findOne({
                collectionData: post.getCollectionData(),
                filter: {
                    ID: postData.ID
                }
            });

            test.equal(databasePostData.isPinned, true, "did not find the pinned post in the database");
        });

        test.it("should unpin the post", async () => {
            const postData = await changePostPinStatus({
                userID,
                postID: postEntity.ID,
                isPinned: false
            });
            const databasePostData = database.findOne({
                collectionData: post.getCollectionData(),
                filter: {
                    ID: postData.ID
                }
            });

            test.equal(databasePostData.isPinned, false, "did not find the unpinned post in the database");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(changePostPinStatus({
                postID: postEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";

            await test.rejects(changePostPinStatus({
                userID,
                postID: postEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an unauthorized user ID", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(changePostPinStatus({
                userID,
                postID: postEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a post ID", async () => {
            await test.rejects(changePostPinStatus({
                userID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect post ID", async () => {
            const postID = "Bob";

            await test.rejects(changePostPinStatus({
                userID,
                postID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without the pin status", async () => {
            await test.rejects(changePostPinStatus({
                userID,
                postID: postEntity.ID
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect pin status", async () => {
            await test.rejects(changePostPinStatus({
                userID,
                postID: postEntity.ID,
                isPinned: "Bob"
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a post in the database", async () => {
            const postID = database.generateID({
                collectionName: post.getCollectionData().name
            });

            await test.rejects(changePostPinStatus({
                userID,
                postID,
                isPinned: true
            }), RequestError, "Did not receive an error");
        });
    });
};

module.exports = changePostPinStatusUseCaseTest;