const generateGuestUserFactory = require("../../useCases/generateGuestUser");
const user = require("../../entities/userEntity");

const generateGuestUserUseCaseTest = (
    {
        test,
        validators,
        database,
        userCookieGenerator,
        RequestError
    }
) => {
    test.describe("Generate guest user use case Test", () => {
        const deviceValue = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36";
        const IP = "201.20.102.152";
        const generateGuestUser = generateGuestUserFactory({
            validators,
            database,
            userCookieGenerator,
            RequestError
        });

        test.before();

        test.it("should create a new guest user", async () => {
            const generatedGuestResult = await generateGuestUser({
                deviceValue,
                IP
            });

            const userDatabaseData = database.findOne({
                collectionData: user.getCollectionData(),
                filter: {
                    ID: generatedGuestResult.ID
                }
            });

            test.equal(validators.isNull(userDatabaseData), false, "did not find the new user in the database");
        });

        test.it("should create a new guest user with full data", async () => {
            const deviceString = "Android";
            const generatedGuestResult = await generateGuestUser({
                deviceValue,
                IP,
                deviceString
            });

            const userDatabaseData = database.findOne({
                collectionData: user.getCollectionData(),
                filter: {
                    ID: generatedGuestResult.ID
                }
            });

            test.equal(validators.isNull(userDatabaseData), false, "did not find the new user in the database");
        });

        test.it("should throw an error when creating a guest without a device value", async () => {
            await test.rejects(generateGuestUser({
                IP
            }), RequestError, "Did not receive a request error");
        });
        test.it("should throw an error when creating a guest with an incorrect device value", async () => {
            const deviceValue = {};

            await test.rejects(generateGuestUser({
                deviceValue,
                IP
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error when creating a guest without an IP value", async () => {
            await test.rejects(generateGuestUser({
                deviceValue
            }), RequestError, "Did not receive a request error");
        });
        test.it("should throw an error when creating a guest with an incorrect IP value", async () => {
            const IP = 42;

            await test.rejects(generateGuestUser({
                deviceValue,
                IP
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error when creating a guest with an incorrect device string value", async () => {
            const deviceString = {};

            await test.rejects(generateGuestUser({
                deviceValue,
                IP,
                deviceString
            }), RequestError, "Did not receive a request error");
        });
    });
};

module.exports = generateGuestUserUseCaseTest;