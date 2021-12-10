const userEntity = require("../entities/userEntity");
const userAuthorizationEntity = require("../entities/userAuthorizationEntity");
const userLogEntity = require("../entities/userLogEntity");

let addPasswordAuthorizationToUserFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        insertEntityIntoDatabase,
        isBoolean,
        isPopulatedArray,
        isNull,
        isHash,
        findOneFromDatabase,
        updateEntityInDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    const insertUserLog = async ({userID, cookie, deviceValue, IP}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = generateDatabaseID({
            collectionData: userLogCollectionData
        });
        const userLogDescription = "Added password authorization method to a user";
        const buildUserLog = userLogEntity.buildUserLogFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp
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
        await insertEntityIntoDatabase({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const getUser = async ({userID, userCollectionData}) => {
        const userData = await findOneFromDatabase({
            collectionData: userCollectionData,
            filter: {
                ID: userID
            }
        });
        if (isNull(userData)) {
            throw new Error("user was not found in the database");
        }

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });

        return buildUser(userData);
    };

    const getUserPasswordAuthorization = async ({userID, userAuthorizationCollectionData}) => {
        const userAuthorizationData = await findOneFromDatabase({
            collectionData: userAuthorizationCollectionData,
            filter: {
                userID: userID,
                variant: "password",
                isActive: true
            }
        });

        return userAuthorizationData;
    };

    const addUserAuthorization = async ({userID, token, userAuthorizationCollectionData}) => {
        const buildUserAuthorization = userAuthorizationEntity.buildUserAuthorizationFactory({
            isID,
            isPopulatedString,
            isBoolean,
            isWithin,
            isHash,
            isPopulatedArray
        });
        const userAuthorizationID = generateDatabaseID({
            collectionData: userAuthorizationCollectionData
        });
        const userAuthorization = buildUserAuthorization({
            ID: userAuthorizationID,
            userID,
            variant: "password",
            token
        });

        await insertEntityIntoDatabase({
            collectionData: userAuthorizationCollectionData,
            entityData: userAuthorization
        });

        return userAuthorization;
    };

    const updateUserData = async ({user, email, name, userCollectionData}) => {
        const userStatuses = userEntity.getUserStatuses();
        const oldUser = transformEntityIntoASimpleObject(user);

        oldUser.email = email;
        oldUser.name = name;
        if (user.getStatus() === userStatuses.STATUS_GUEST) {
            oldUser.status = userStatuses.STATUS_AUTHORIZED;
        }

        const buildUser = userEntity.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const newUser = buildUser(oldUser);

        await updateEntityInDatabase({
            collectionData: userCollectionData,
            entityData: newUser
        });
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
        const userCollectionData = userEntity.getCollectionData();
        const userAuthorizationCollectionData = userAuthorizationEntity.getCollectionData();

        let user = await getUser({
            userID,
            userCollectionData
        });
        const existingUserPasswordAuthorization = await getUserPasswordAuthorization({
            userID,
            userAuthorizationCollectionData
        });
        if (!isNull(existingUserPasswordAuthorization)) {
            throw new Error("user already has a password authorization method");
        }


        const token = [login, password].join(",");
        await addUserAuthorization({
            userID: user.getID(),
            token,
            userAuthorizationCollectionData
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