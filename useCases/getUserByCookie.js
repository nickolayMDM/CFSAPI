const userEntity = require("../entities/userEntity");

let getUserByCookieFactory = (
    {
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        generateUserCookie,
        findOneFromDatabase
    }
) => {
    return async (
        {
            userID,
            cookieValue,
            deviceValue,
            IP
        }
    ) => {
        const realCookieValue = await generateUserCookie({
            deviceValue,
            IP,
            userID
        });

        console.log("realCookieValue", deviceValue, IP, userID);
        console.log("getUserByCookie", realCookieValue, cookieValue);
        if (realCookieValue !== cookieValue) {
            throw new Error("cookie value does not match the provided data");
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

module.exports = getUserByCookieFactory;