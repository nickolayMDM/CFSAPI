const userEntity = require("../entities/userEntity");

let getUserByIDFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        findOneFromDatabase
    }
) => {
    return async (
        {
            userID
        }
    ) => {

        if (!isID(userID)) {
            throw new Error("provided input is invalid");
        }

        const userData = await findOneFromDatabase({
            collectionData: userEntity.getCollectionData(),
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
        const user = buildUser(userData);

        return user;
    }
};

module.exports = getUserByIDFactory;