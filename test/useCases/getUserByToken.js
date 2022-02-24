const userEntity = require("../../entities/userEntity");
const userAuthorizationEntity = require("../../entities/userAuthorizationEntity");
const getUserByTokenFactory = require("../../useCases/getUserByToken");

const getUserByTokenUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        userCookieGenerator,
        hashing,
        RequestError
    }
) => {
    test.describe("Get user by token use case Test", () => {
        const deviceValue = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
        const IP = "0.0.0.1";
        const getUserByToken = getUserByTokenFactory({
            validators,
            database,
            objectHelpers,
            userCookieGenerator,
            hashing,
            RequestError
        });
        const userPassword = "BobsPassword";
        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const userCollectionData = userEntity.getCollectionData();
        const user = buildUser({
            ID: database.generateID({
                collectionName: userCollectionData.name
            }),
            name: "Bob",
            email: "bobsemail@fake.mail",
            status: userEntity.getUserStatuses().STATUS_AUTHORIZED
        });
        const guestUser = buildUser({
            ID: database.generateID({
                collectionName: userCollectionData.name
            }),
            name: "NotBob",
            email: "notbobsemail@fake.mail"
        });

        const buildUserAuthorization = userAuthorizationEntity.buildUserAuthorizationFactory({
            validators,
            database
        });
        const userAuthorizationCollectionData = userAuthorizationEntity.getCollectionData();

        test.before(async () => {
            await database.insertEntity({
                collectionData: userCollectionData,
                entityData: user
            });
            await database.insertEntity({
                collectionData: userCollectionData,
                entityData: guestUser
            });

            const userPasswordHash = await hashing.hash(userPassword);
            const userPasswordAuthorization = buildUserAuthorization({
                ID: database.generateID({
                    collectionName: userAuthorizationCollectionData.name
                }),
                userID: user.getID(),
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                additional: {
                    password: userPasswordHash
                }
            });
            await database.insertEntity({
                collectionData: userAuthorizationCollectionData,
                entityData: userPasswordAuthorization
            });
        });

        test.it("should get the user by a password authorization variant", async () => {
            const userResponse = await getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue,
                IP,
                additional: {
                    password: userPassword
                }
            });

            test.equal(userResponse.name, user.getName(), "Did not find correct data");
        });

        test.it("should throw an error without a variant", async () => {
            await test.rejects(getUserByToken({
                token: user.getName(),
                deviceValue,
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an invalid variant", async () => {
            await test.rejects(getUserByToken({
                variant: "Bob",
                token: user.getName(),
                deviceValue,
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without a token", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                deviceValue,
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an invalid token", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: 42,
                deviceValue,
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without a device value", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an invalid device value", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue: 42,
                IP,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error without an IP", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error with an invalid IP", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue,
                IP: 42,
                additional: {
                    password: userPassword
                }
            }), Error, "Did not receive the expected error", true);
        });

        test.it("should throw an error when trying to get the user with a password variant and without an additional.password value", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        test.it("should throw an error when trying to get the user with a password variant and an invalid additional.password value", async () => {
            await test.rejects(getUserByToken({
                variant: userAuthorizationEntity.getUserAuthorizationVariants().VARIANT_PASSWORD,
                token: user.getName(),
                deviceValue,
                IP,
                additional: {
                    password: {}
                }
            }), Error, "Did not receive the expected error", true);
        });
    });
};

module.exports = getUserByTokenUseCaseTest;