const userEntity = require("../../entities/userEntity");
const getUserByCookieFactory = require("../../useCases/getUserByCookie");

const getUserByCookieUseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        testBefore,
        isDefined,
        isEmail,
        isWithin,
        isID,
        isNull,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        insertIntoDatabase,
        generateDatabaseID,
        generateUserCookie,
        findOneFromDatabase,
        insertEntityIntoDatabase
    }
) => {
    testDescribe("Get user by cookie use case Test", () => {
        const cookieValue = "db578ea6cdb53d700f674c2cfcfb449c,0";
        const deviceValue = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
        const IP = "0.0.0.1";
        const falseCookieValue = "502455b39f97f177c58f06bd25cb6792,0";
        const falseDeviceValue = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36";
        const falseIP = "0.0.0.2";
        const getUserByCookie = getUserByCookieFactory({
            isDefined,
            isEmail,
            isWithin,
            isID,
            isNull,
            generateUserCookie,
            generateDatabaseID,
            findOneFromDatabase,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            insertEntityIntoDatabase
        });
        const userCollectionData = userEntity.getCollectionData();
        const user = {
            ID: generateDatabaseID({
                collectionData: userCollectionData
            }),
            name: "Bob",
            email: "bobsemail@fake.mail",
            status: "guest"
        };

        testBefore(async () => {
            await insertIntoDatabase({
                collectionData: userCollectionData,
                data: user
            });
        });

        testIt("should get user with user ID, cookie value, device value, and IP", async () => {
            const userResponse = await getUserByCookie({
                userID: user.ID,
                cookieValue,
                deviceValue,
                IP
            });

            testEqual(userResponse.getID(), user.ID, "Did not find correct data");
        });

        testIt("should throw an error with a false cookie value", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                cookieValue: falseCookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error with a false device value", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                cookieValue,
                deviceValue: falseDeviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error with a false IP", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                cookieValue,
                deviceValue,
                IP: falseIP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error without a user ID", () => {
            testThrows(getUserByCookie.bind(this, {
                cookieValue,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error without a cookie value", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                deviceValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error without a device value", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                cookieValue,
                IP
            }), Error, "Did not receive the expected error", true);
        });
        testIt("should throw an error without an IP", () => {
            testThrows(getUserByCookie.bind(this, {
                userID: user.ID,
                cookieValue,
                deviceValue
            }), Error, "Did not receive the expected error", true);
        });
    });
};

module.exports = getUserByCookieUseCaseTest;