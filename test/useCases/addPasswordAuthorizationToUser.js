const addPasswordAuthorizationToUserFactory = require("../../useCases/addPasswordAuthorizationToUser");
const user = require("../../entities/userEntity");

const addPasswordAuthorizationToUserUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        hashing,
        RequestError
    }
) => {
    const createUser = async () => {
        const userCollectionData = user.getCollectionData();

        const userID = database.generateID({
            collectionName: userCollectionData.name
        });
        const buildUser = user.buildUserFactory({
            validators,
            database
        });
        const userEntity = buildUser({
            ID: userID,
            name: "Bob",
            status: user.getUserStatuses().STATUS_AUTHORIZED
        });
        await database.insertEntity({
            collectionData: user.getCollectionData(),
            entityData: userEntity
        });

        return userEntity;
    };

    test.describe("Add password authorization to user use case test", () => {
        const addPasswordAuthorizationToUser = addPasswordAuthorizationToUserFactory({
            validators,
            database,
            objectHelpers,
            hashing,
            RequestError
        });
        const userAuthorizationDataPart = {
            login: "BobLogin",
            email: "BobEmail@fake.mail",
            password: "BobPassword",
            deviceValue: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
            IP: "201.20.102.152"
        };

        test.before();

        test.it("should add a minimal password authorization", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            delete userAuthorizationData.email;
            const newUserEntity = await addPasswordAuthorizationToUser(userAuthorizationData);

            test.equal((newUserEntity.getID() === userAuthorizationData.userID && newUserEntity.getStatus() === user.getUserStatuses().STATUS_AUTHORIZED), true, "did not find the correct user data in the database");
        });

        test.it("should add a full password authorization", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            const newUserEntity = await addPasswordAuthorizationToUser(userAuthorizationData);

            test.equal((newUserEntity.getID() === userAuthorizationData.userID && newUserEntity.getStatus() === user.getUserStatuses().STATUS_AUTHORIZED), true, "did not find the correct user data in the database");
        });

        test.it("should throw an error with a user ID not connected to a user", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID
            };

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization with a user ID not connected to a user");
        });

        test.it("should throw an error without a user ID", async () => {
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
            };

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization without a user ID");
        });
        test.it("should throw an error without a login value", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            delete userAuthorizationData.login;

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization without a login value");
        });
        test.it("should throw an error with an invalid email value", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID(),
                email: "Bob"
            };

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization with an invalid email value");
        });
        test.it("should throw an error without a password value", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            delete userAuthorizationData.password;

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization without a password value");
        });
        test.it("should throw an error without a device value", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            delete userAuthorizationData.deviceValue;

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization without a device value");
        });
        test.it("should throw an error without an IP", async () => {
            const userEntity = await createUser();
            const userAuthorizationData = {
                ...userAuthorizationDataPart,
                userID: userEntity.getID()
            };
            delete userAuthorizationData.IP;

            await test.rejects(addPasswordAuthorizationToUser(userAuthorizationData), RequestError, "Did not receive an error when trying to add an authorization without an IP");
        });
    });
};

module.exports = addPasswordAuthorizationToUserUseCaseTest;