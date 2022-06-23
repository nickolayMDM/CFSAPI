const userLogEntity = require("../entities/userLogEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "set user language use case error: ";

let setUserLanguage = (
    {
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    const insertUserLog = async ({userID, language}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Set a language",
            additional: {
                language
            }
        });
        await database.insertEntity({
            collectionData: userLogCollectionData,
            entityData: userLog
        });
    };

    const setLanguage = async ({oldUser, language}) => {
        let userData = objectHelpers.transformEntityIntoASimpleObject(oldUser);
        userData.language = language;

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });

        const user = buildUser(userData);

        await database.updateEntity({
            collectionData: userEntity.getCollectionData(),
            entityData: user
        });

        return user;
    };

    const getUser = async ({userID}) => {
        const userData = await database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            return null;
        }

        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const user = buildUser(userData);

        return user;
    };

    return async (
        {
            userID,
            language
        } = {}
    ) => {
        if (
            !database.isID(userID)
            || !validators.isPopulatedString(language)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID,
                language
            });
        }

        const oldUser = await getUser({userID});
        if (validators.isNull(oldUser)) {
            throw new RequestError(errorPrefix + "user not found", {
                userID
            });
        }

        const user = await setLanguage({
            oldUser,
            language
        });

        await insertUserLog({
            userID,
            language
        });

        let paymentData = objectHelpers.transformEntityIntoASimpleObject(user, [
            "ID",
            "language"
        ]);
        return Object.freeze(paymentData);
    }
};

module.exports = setUserLanguage;