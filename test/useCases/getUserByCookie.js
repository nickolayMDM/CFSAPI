const userEntity = require("../../entities/userEntity");
const getUserByCookieFactory = require("../../useCases/getUserByCookie");

const getUserByCookieUseCaseTest = (
    {
        test,
        validators,
        database,
        userCookieGenerator,
        RequestError
    }
) => {
    test.describe("Get user by cookie use case Test", () => {
        const deviceValue = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
        const IP = "0.0.0.1";
        const falseCookieValue = "502455b39f97f177c58f06bd25cb6792,0";
        const falseDeviceValue = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36";
        const falseIP = "0.0.0.2";
        const getUserByCookie = getUserByCookieFactory({
            validators,
            database,
            userCookieGenerator,
            RequestError
        });
        let cookieValue, user;

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

            cookieValue = await userCookieGenerator.generateUserCookie({
                deviceValue,
                IP,
                userID: user.getID()
            });
        });

        test.it("should get user with user ID, cookie value, device value, and IP", async () => {
            const userResponse = await getUserByCookie({
                userID: user.getID(),
                cookieValue,
                deviceValue,
                IP
            });

            test.equal(userResponse.getID(), user.getID(), "Did not find correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(getUserByCookie({
                cookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            await test.rejects(getUserByCookie({
                userID: "Bob",
                cookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with a non-existent user ID", async () => {
            await test.rejects(getUserByCookie({
                userID: database.generateID({
                    collectionData: userEntity.getCollectionData()
                }),
                cookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without a cookie value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an incorrect cookie value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue: "someRandomText",
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with a false cookie value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue: falseCookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without a device value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an incorrect device value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue,
                deviceValue: 42,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with a false device value", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue,
                deviceValue: falseDeviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without an IP", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue,
                deviceValue
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an incorrect IP", async () => {
            await test.rejects(getUserByCookie({
                userID: user.getID(),
                cookieValue,
                deviceValue,
                IP: {}
            }), Error, "Did not receive the expected error", true);
        });
    });
};

module.exports = getUserByCookieUseCaseTest;