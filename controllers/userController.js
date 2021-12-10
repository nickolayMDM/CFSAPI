const cookies = require("../adapters/cookiesAdapter");
const database = require("../adapters/databaseAdapter");
const userCookieGenerator = require("../adapters/userCookieGeneratorAdapter");
const debug = require("../adapters/debugAdapter");
const generateGuestUserFactory = require("../useCases/generateGuestUser");
const getUserByIDFactory = require("../useCases/getUserByID");
const getUserByCookieFactory = require("../useCases/getUserByCookie");
const getUserByTokenFactory = require("../useCases/getUserByToken");
const addPasswordAuthorizationToUserFactory = require("../useCases/addPasswordAuthorizationToUser");
const getPostsCountUseCaseFactory = require("../useCases/getPostsCount");
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
    if (validators.isNull(parsedUserCookie)) {
        return next();
    }

    try {
        user = await _getUserByCookie({
            userID: parsedUserCookie.userID,
            cookieValue: userCookie,
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req)
        });
    } catch (error) {
        await debug.returnServerError({
            error
        });
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

const getOwnUser = async (req, res) => {
    const sessionUserID = req.currentUserID;
    let userEntity;

    if (!database.isID(sessionUserID)) {
        res.status(404).json({error: "user not authorized"})
    }

    const getUserByID = getUserByIDFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isNull: validators.isNull,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity
    });

    try {
        userEntity = await getUserByID({
            userID: sessionUserID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }
    const user = objectHelpers.transformEntityIntoASimpleObject(userEntity, [
        "name",
        "email",
        "status"
    ]);

    return res.status(200).json(user);
};

const getUserByPassword = async (req, res) => {
    const name = req.query.name;
    const password = req.query.password;
    const token = name + "," + password;
    let userData = {};

    const sessionUserID = req.currentUserID;
    if (!database.isID(sessionUserID)) {
        res.status(404).json({error: "user not authorized"})
    }

    const getUserByToken = getUserByTokenFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isNull: validators.isNull,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        isBoolean: validators.isBoolean,
        isHash: validators.isMD5Hash,
        isPopulatedArray: validators.isPopulatedArray,
        generateUserCookie: userCookieGenerator.generateUserCookie,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject
    });

    try {
        userData = await getUserByToken({
            token,
            variant: "password",
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req)
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    const sessionUser = _getUserByID(sessionUserID);
    if (sessionUser.getStatus() === "guest") {
        let arePopulatedGuestContents = false;
        const getPostsCountUseCase = getPostsCountUseCaseFactory({
            isDefined: validators.isDefined,
            isID: database.isID,
            isPopulatedString: validators.isPopulatedString,
            isPopulatedObject: validators.isPopulatedObject,
            isTimestamp: validators.isTimestamp,
            generateDatabaseID: database.generateID,
            countInDatabase: database.count,
            insertIntoDatabase: database.insert
        });

        try {
            const postsCount = await getPostsCountUseCase({
                userID: sessionUser.getID()
            });

            arePopulatedGuestContents = (postsCount > 0);
        } catch (error) {
            return await debug.returnServerError({
                res,
                error
            });
        }

        if (arePopulatedGuestContents) {
            userData.mergingUserID = sessionUser.getID();
        }
    }
    return res.status(200).json(userData);
};

const addPasswordAuthorizationToUser = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let userEntity;

    const sessionUserID = req.currentUserID;
    if (!database.isID(sessionUserID)) {
        res.status(404).json({error: "user not authorized"})
    }

    const addPasswordAuthorizationToUser = addPasswordAuthorizationToUserFactory({
        isDefined: validators.isDefined,
        isEmail: validators.isEmail,
        isWithin: validators.isWithin,
        isID: database.isID,
        isNull: validators.isNull,
        isPopulatedString: validators.isPopulatedString,
        isPopulatedObject: validators.isPopulatedObject,
        isTimestamp: validators.isTimestamp,
        generateDatabaseID: database.generateID,
        findOneFromDatabase: database.findOne,
        insertEntityIntoDatabase: database.insertEntity,
        isBoolean: validators.isBoolean,
        isHash: validators.isMD5Hash,
        isPopulatedArray: validators.isPopulatedArray,
        transformEntityIntoASimpleObject: objectHelpers.transformEntityIntoASimpleObject,
        updateEntityInDatabase: database.updateEntity
    });

    try {
        userEntity = await addPasswordAuthorizationToUser({
            userID: sessionUserID,
            login: name,
            email,
            password,
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req)
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }
    const user = objectHelpers.transformEntityIntoASimpleObject(userEntity, [
        "name",
        "email",
        "status"
    ]);

    return res.status(200).json(user);
};

module.exports = {
    authorize,
    getOwnUser,
    setRequestUserMiddleware,
    authorizeMiddleware,
    getUserByPassword,
    addPasswordAuthorizationToUser
};