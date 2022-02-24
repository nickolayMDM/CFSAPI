const userEntity = require("../../entities/userEntity");
const getUserByIDFactory = require("../../useCases/getUserByID");

const getUserByIDUseCaseTest = (
    {
        test,
        validators,
        database,
        RequestError
    }
) => {
    test.describe("Get user by ID use case Test", () => {
        const getUserByID = getUserByIDFactory({
            validators,
            database,
            RequestError
        });
        let user;

        test.before(async () => {
            const buildUser = userEntity.buildUserFactory({
                validators,
                database
            });
            const userData = {
                ID: database.generateID({
                    collectionData: userEntity.getCollectionData()
                }),
                name: "Bob",
                email: "bobsemail@fake.mail"
            };
            user = buildUser(userData);
            await database.insertEntity({
                collectionData: userEntity.getCollectionData(),
                entityData: user
            });
        });

        test.it("should get user with user ID", async () => {
            const userResponse = await getUserByID({
                userID: user.getID()
            });

            test.equal(userResponse.getID(), user.getID(), "Did not find correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(getUserByID({}), RequestError, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            await test.rejects(getUserByID({
                userID: "Bob"
            }), RequestError, "Did not receive the expected error", true);
        });
        test.it("should throw an error with a non-existent user ID", async () => {
            const userID = database.generateID({
                collectionData: userEntity.getCollectionData()
            });

            await test.rejects(getUserByID({
                userID
            }), RequestError, "Did not receive the expected error", true);
        });
    });
};

module.exports = getUserByIDUseCaseTest;