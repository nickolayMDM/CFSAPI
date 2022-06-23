const userEntity = require("../entities/userEntity");
const userAuthorizationEntity = require("../entities/userAuthorizationEntity");
const userLogEntity = require("../entities/userLogEntity");

const errorPrefix = "add password authorization to user use case error: ";

let addPasswordAuthorizationToUserFactory = (
    {
        validators,
        database,
        mail,
        objectHelpers,
        hashing,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, cookie, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Added password authorization method to a user";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: userLogDescription,
            additional: {
                cookie,
                deviceValue,
                IP
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const getUser = async ({userID, userCollectionData}) => {
        const userData = await database.findOne({
            collectionData: userCollectionData,
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user was not found in the database", {
                userID
            });
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });

        return buildUser(userData);
    };

    const getUserPasswordAuthorization = async ({userID, userAuthorizationCollectionData}) => {
        const userAuthorizationData = await database.findOne({
            collectionData: userAuthorizationCollectionData,
            filter: {
                userID: userID,
                variant: "password",
                isActive: true
            }
        });

        return userAuthorizationData;
    };

    const getUserPasswordAuthorizationByToken = async ({token, userAuthorizationCollectionData}) => {
        const userAuthorizationData = await database.findOne({
            collectionData: userAuthorizationCollectionData,
            filter: {
                token,
                variant: "password",
                isActive: true
            }
        });

        return userAuthorizationData;
    };

    const addUserAuthorization = async ({userID, token, password, userAuthorizationCollectionData}) => {
        const buildUserAuthorization = userAuthorizationEntity.buildUserAuthorizationFactory({
            validators,
            database
        });
        const userAuthorizationID = database.generateID({
            collectionData: userAuthorizationCollectionData
        });
        const userAuthorization = buildUserAuthorization({
            ID: userAuthorizationID,
            userID,
            variant: "password",
            token,
            additional: {
                password
            }
        });

        await database.insertEntity({
            collectionData: userAuthorizationCollectionData,
            entityData: userAuthorization
        });

        return userAuthorization;
    };

    const updateUserData = async ({user, email, name, userCollectionData}) => {
        const userStatuses = userEntity.getUserStatuses();
        const oldUser = objectHelpers.transformEntityIntoASimpleObject(user);

        oldUser.email = email;
        oldUser.name = name;
        if (user.getStatus() === userStatuses.STATUS_GUEST) {
            oldUser.status = userStatuses.STATUS_AUTHORIZED;
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const newUser = buildUser(oldUser);

        await database.updateEntity({
            collectionData: userCollectionData,
            entityData: newUser
        });
    };

    const securePassword = async (password) => {
        return await hashing.hash(password);
    };

    const sendMailToNewUser = async ({email, userStatus}) => {
        const userStatuses = userEntity.getUserStatuses();

        if (
            !validators.isDefined(email)
            || !validators.isEmail(email)
            || !validators.isPopulatedString(userStatus)
            || userStatus != userStatuses.STATUS_GUEST
        ) {
            return false;
        }

        //TODO: this causes 500 error for some reason

        // let mailInstance = new mail();
        // await mailInstance.init();
        // let test = await mailInstance.sendFile({
        //     to: email,
        //     filesDirectory: "registration"
        // });
    };

    return async (
        {
            userID,
            login,
            email,
            password,
            deviceValue,
            IP
        }
    ) => {
        if (
            !database.isID(userID)
            || !validators.isPopulatedString(login)
            || !validators.isPopulatedString(password)
            || !validators.isPopulatedString(deviceValue)
            || (
                validators.isDefined(email) && !validators.isEmail(email)
            )
            || !validators.isPopulatedString(IP)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                login,
                email,
                password,
                deviceValue,
                IP
            });
        }

        const userCollectionData = userEntity.getCollectionData();
        const userAuthorizationCollectionData = userAuthorizationEntity.getCollectionData();
        const token = login;

        let user = await getUser({
            userID,
            userCollectionData
        });
        if (validators.isNull(user)) {
            throw new RequestError(errorPrefix + "user with given ID was not found", {
                userID
            }, "userNotFound");
        }
        const existingUserPasswordAuthorization = await getUserPasswordAuthorization({
            userID,
            userAuthorizationCollectionData
        });
        if (!validators.isNull(existingUserPasswordAuthorization)) {
            throw new RequestError(errorPrefix + "user already has a password authorization method", {
                userID
            }, "authExists");
        }

        const existingUserPasswordAuthorizationToken = await getUserPasswordAuthorizationByToken({
            token,
            userAuthorizationCollectionData
        });
        if (!validators.isNull(existingUserPasswordAuthorizationToken)) {
            throw new RequestError(errorPrefix + "token is already in use", {
                userID
            }, "tokenExists");
        }

        const hashedPassword = await securePassword(password);
        await addUserAuthorization({
            userID: user.getID(),
            token,
            password: hashedPassword,
            userAuthorizationCollectionData
        });
        await sendMailToNewUser({
            email,
            userStatus: user.getStatus()
        });

        await updateUserData({
            userCollectionData,
            user,
            name: login,
            email
        });

        const newUser = await getUser({
            userID,
            userCollectionData
        });

        await insertUserLog({
            userID: newUser.getID(),
            deviceValue,
            IP,
            token
        });

        return newUser;
    }
};

module.exports = addPasswordAuthorizationToUserFactory;