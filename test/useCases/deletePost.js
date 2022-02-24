const deletePostFactory = require("../../useCases/deletePost");
const addPostFactory = require("../../useCases/addPost");
const user = require("../../entities/userEntity");
const post = require("../../entities/postEntity");

const deletePostUseCaseTest = (
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
    test.describe("Delete post use case test", () => {
        const addPost = addPostFactory({
            validators,
            database,
            objectHelpers,
            processPostInput,
            imageProcessorObject,
            RequestError
        });
        const deletePost = deletePostFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const userID = database.generateID({
            collectionName: user.getCollectionData().name
        });

        test.before();

        test.it("should delete the post", async () => {
            const postData = await addPost({
                name: "post to delete",
                url: "https://test.web/page/post",
                userID
            });
            await deletePost({
                userID,
                postID: postData.ID
            });

            const databasePostData = database.findOne({
                collectionData: post.getCollectionData(),
                filter: {
                    ID: postData.ID,
                    isDeleted: true
                }
            });

            test.equal(validators.isNull(databasePostData), false, "did not find the deleted post in the database");
        });

        test.it("should throw an error when deleting a deleted post", async () => {
            const postData = await addPost({
                name: "post to delete with error 1",
                url: "https://test.web/page/postErr1",
                userID
            });
            await deletePost({
                userID,
                postID: postData.ID
            });

            await test.rejects(deletePost({
                userID,
                postID: postData.ID
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error without a user ID", async () => {
            const postData = await addPost({
                name: "post to delete with error 2",
                url: "https://test.web/page/postErr2",
                userID
            });

            await test.rejects(deletePost({
                postID: postData.ID
            }), RequestError, "Did not receive a request error");
        });
        test.it("should throw an error with an unauthorized user ID", async () => {
            const postData = await addPost({
                name: "post to delete with error 3",
                url: "https://test.web/page/postErr3",
                userID
            });
            const unauthorizedUserID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(deletePost({
                postID: postData.ID,
                userID: unauthorizedUserID
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error without a post ID", async () => {
            await test.rejects(deletePost({
                userID
            }), RequestError, "Did not receive a request error");
        });
    });
};

module.exports = deletePostUseCaseTest;