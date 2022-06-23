const cookies = require("../adapters/cookiesAdapter");
const database = require("../adapters/databaseAdapter");
const userCookieGenerator = require("../adapters/userCookieGeneratorAdapter");
const debug = require("../adapters/debugAdapter");
const hashing = require("../adapters/hashingAdapter");
const mail = require("../adapters/mailAdapter");
const generateGuestUserFactory = require("../useCases/generateGuestUser");
const getUserByIDFactory = require("../useCases/getUserByID");
const getUserByCookieFactory = require("../useCases/getUserByCookie");
const getUserByTokenFactory = require("../useCases/getUserByToken");
const addPasswordAuthorizationToUserFactory = require("../useCases/addPasswordAuthorizationToUser");
const getPostsCountFactory = require("../useCases/getPostsCount");
const mergeUsersUseCaseFactory = require("../useCases/mergeUsers");
const addOnetimePremiumPaymentFactory = require("../useCases/addOnetimePremiumPayment");
const setUserAsPremiumFactory = require("../useCases/setUserAsPremium");
const setUserLanguageFactory = require("../useCases/setUserLanguage");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const httpHelpers = require("../helpers/http");
const timeHelpers = require("../helpers/time");
const config = require("../config");
const RequestError = require("../errors/RequestError");

const _generateNewUser = async (req, res) => {
    const generateGuestUser = generateGuestUserFactory({
        validators,
        database,
        userCookieGenerator,
        RequestError
    });
    const newGuestUserData = await generateGuestUser({
        deviceValue: httpHelpers.getUserAgentFromRequest(req),
        IP: httpHelpers.getIPFromRequest(req),
        deviceString: req.get("app-device-string") || ""
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
        validators,
        database,
        RequestError
    });
    return await getUserByID({
        userID
    });
};

const _getUserByCookie = async ({userID, cookieValue, deviceValue, IP}) => {
    const getUserByCookie = getUserByCookieFactory({
        validators,
        database,
        userCookieGenerator,
        RequestError
    });

    return getUserByCookie({
        userID,
        cookieValue,
        deviceValue,
        IP
    });
};

const authorizeMiddleware = async (req, res, next) => {
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
        //Error silencer
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
        return res.status(404).json({error: "user not authorized"})
    }

    const getUserByID = getUserByIDFactory({
        validators,
        database,
        RequestError
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
        "status",
        "subscriptionType"
    ]);

    return res.status(200).json(user);
};

const getUserByPassword = async (req, res) => {
    const name = req.query.name;
    const password = req.query.password;
    let userData = {};

    const sessionUserID = req.currentUserID;
    if (!database.isID(sessionUserID)) {
        res.status(404).json({error: "user not authorized"})
    }

    const getUserByToken = getUserByTokenFactory({
        validators,
        database,
        objectHelpers,
        userCookieGenerator,
        hashing,
        RequestError
    });

    try {
        userData = await getUserByToken({
            token: name,
            variant: "password",
            deviceValue: httpHelpers.getUserAgentFromRequest(req),
            IP: httpHelpers.getIPFromRequest(req),
            additional: {
                password
            }
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    let sessionUser;
    try {
        sessionUser = await _getUserByID(sessionUserID);
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }
    if (sessionUser.getStatus() === "guest") {
        let arePopulatedGuestContents = false;
        const getPostsCountUseCase = getPostsCountFactory({
            validators,
            database,
            RequestError
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
        validators,
        database,
        mail,
        objectHelpers,
        hashing,
        RequestError
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
        "status",
        "subscriptionType"
    ]);

    return res.status(200).json(user);
};

const mergeUserWithCurrent = async (req, res) => {
    const fromUserID = req.body.user;
    const toUserID = req.currentUserID;
    if (!database.isID(toUserID)) {
        res.status(404).json({error: "user not authorized"})
    }

    const mergeUsers = mergeUsersUseCaseFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    try {
        await mergeUsers({
            toUserID,
            fromUserID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({});
};

const payForPremium = async (req, res) => {
    const status = httpHelpers.getParamFromRequest(req, "status");
    const details = httpHelpers.getParamFromRequest(req, "details");
    const sessionUserID = req.currentUserID;

    const addOnetimePremiumPayment = addOnetimePremiumPaymentFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });
    const setUserAsPremium = setUserAsPremiumFactory({
        validators,
        database,
        objectHelpers,
        timeHelpers,
        RequestError
    });

    let payment, user;
    try {
        payment = await addOnetimePremiumPayment({
            userID: sessionUserID,
            status,
            details
        });

        user = await setUserAsPremium({
            userID: sessionUserID
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        user
    });
};

const setLanguage = async (req, res) => {
    const language = httpHelpers.getParamFromRequest(req, "language");
    const sessionUserID = req.currentUserID;

    const setUserLanguage = setUserLanguageFactory({
        validators,
        database,
        objectHelpers,
        RequestError
    });

    let user;
    try {
        user = await setUserLanguage({
            userID: sessionUserID,
            language
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json({
        user
    });
};

module.exports = {
    authorize,
    getOwnUser,
    setRequestUserMiddleware,
    authorizeMiddleware,
    getUserByPassword,
    addPasswordAuthorizationToUser,
    mergeUserWithCurrent,
    payForPremium,
    setLanguage
};