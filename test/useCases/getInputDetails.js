const getInputDetailsFactory = require("../../useCases/getInputDetails");
const user = require("../../entities/userEntity");

const getInputDetailsUseCaseTest = (
    {
        test,
        validators,
        database,
        processPostInput,
        RequestError
    }
) => {
    test.describe("Get input details use case test", () => {
        const getInputDetails = getInputDetailsFactory({
            validators,
            database,
            processPostInput,
            RequestError
        });
        let userEntity;

        test.before(async () => {
            const buildUser = user.buildUserFactory({
                validators,
                database
            });

            userEntity = buildUser({
                ID: database.generateID({
                    collectionName: user.getCollectionData().name
                })
            });

            await database.insertEntity({
                collectionData: user.getCollectionData(),
                entityData: userEntity
            });
        });

        test.it("should return an object", async () => {
            const inputDetails = await getInputDetails({
                userID: userEntity.getID(),
                postInput: "https://post.input/data"
            });

            test.equal(validators.isPopulatedObject(inputDetails), true, "Did not receive correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(getInputDetails({
                postInput: "https://post.input/data"
            }), RequestError, "Did not receive an error without a user ID");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";

            await test.rejects(getInputDetails({
                userID,
                postInput: "https://post.input/data"
            }), RequestError, "Did not receive an error with an incorrect user ID");
        });
        test.it("should throw an error without a user in the database", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(getInputDetails({
                userID,
                postInput: ""
            }), RequestError, "Did not receive an error without a user ID");
        });

        test.it("should throw an error without the post input", async () => {
            await test.rejects(getInputDetails({
                userID: userEntity.getID()
            }), RequestError, "Did not receive an error without the post input");
        });
        test.it("should throw an error with incorrect post input", async () => {
            await test.rejects(getInputDetails({
                userID: userEntity.getID(),
                postInput: {}
            }), RequestError, "Did not receive an error with incorrect post input");
        });
    });
};

module.exports = getInputDetailsUseCaseTest;