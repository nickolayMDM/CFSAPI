const cookies = require("../adapters/cookiesAdapter");
const database = require("../adapters/databaseAdapter");
const userCookieGenerator = require("../adapters/userCookieGeneratorAdapter");
const generateGuestUserFactory = require("../useCases/generateGuestUser");
const getUserByIDFactory = require("../useCases/getUserByID");
const getUserByCookieFactory = require("../useCases/getUserByCookie");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const httpHelpers = require("../helpers/http");
const config = require("../config");

const _generateNewUser = async (req, res) => {
    const generateGuestUser = generateGuestUserFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        generateDatabaseID: database.generateID,
        insertEntityIntoDatabase: database.insertEntity,
        generateUserCookie: userCookieGenerator.generateUserCookie
    });
    const newGuestUserData = await generateGuestUser({
        deviceValue: httpHelpers.getUserAgentFromRequest(req),
        IP: httpHelpers.getIPFromRequest(req)
    });

    cookies.set({
        res,
        key: "user",
        value: newGuestUserData.cookie
    });

    return newGuestUserData
};

const _getUserByID = async (userID) => {
    const getUserByID = getUserByIDFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isNull: validators.isNull,
        findOneFromDatabase: database.findOne,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        generateDatabaseID: database.generateID,
        insertEntityIntoDatabase: objectHelpers.transformEntityIntoASimpleObject
    });

    return await getUserByID({
        userID
    });
};

const _getUserByCookie = async ({userID, cookieValue, deviceValue, IP}) => {
    const getUserByCookie = getUserByCookieFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isNull: validators.isNull,
        generateUserCookie: userCookieGenerator.generateUserCookie,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        insertEntityIntoDatabase: objectHelpers.transformEntityIntoASimpleObject
    });

    return getUserByCookie({
        userID,
        cookieValue,
        deviceValue,
        IP
    });
};

const authorizeMiddleware = (req, res, next) => {
    if (req.path.substr(0, 7) === "/public") {
        return next();
    }

    const externalAuthString = req.get("app-auth-string");

    if (config.clientAuthString !== externalAuthString) {
        return res.status(400).json({
            error: "incorrect auth string"
        });
    }

    next();
};

const setRequestUserMiddleware = async (req, res, next) => {
    let user;
    const userCookie = req.get("app-user-string");
    const parsedUserCookie = userCookieGenerator.parseUserCookie(userCookie);

    try {
        user = await _getUserByCookie({
            userID: parsedUserCookie.userID,
            cookieValue: userCookie,
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req)
        });
    } catch (e) {
        console.log(e);
    }

    if (typeof user !== "undefined") {
        req.currentUserID = user.getID();
    }

    next();
};

const authorize = async (req, res) => {
    let response = {};
    if (!database.isID(req.currentUserID)) {
        const newUserData = await _generateNewUser(req, res);
        const newUserCookieValue = await userCookieGenerator.generateUserCookie({
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req),
            userID: newUserData.ID
        });

        response.newUserString = newUserCookieValue;
    }

    return res.status(200).json(response);
};

module.exports = { authorize, setRequestUserMiddleware, authorizeMiddleware };