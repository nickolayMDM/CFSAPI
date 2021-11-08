const generateGuestUserFactory = require("../../useCases/generateGuestUser");
const user = require("../../entities/userEntity");

const generateGuestUserUseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testBefore,
        isCookie,
        isDefined,
        isEmail,
        isWithin,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID,
        insertMultipleIntoDatabase,
        findOneFromDatabase,
        generateUserCookie
    }
) => {
    testDescribe("Generate guest user use case Test", () => {
        const deviceValue = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36";
        const IP = "201.20.102.152";
        const generateGuestUser = generateGuestUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            generateDatabaseID,
            insertMultipleIntoDatabase,
            generateUserCookie
        });
        let generatedGuestResult, userDatabaseData;

        testBefore(async () => {
            generatedGuestResult = await generateGuestUser({
                deviceValue,
                IP
            });

            userDatabaseData = findOneFromDatabase({
                collectionData: user.getCollectionData(),
                filter: {
                    ID: generatedGuestResult.ID
                }
            });
        });

        testIt("should retrieve a new guest user", () => {
            testEqual(typeof userDatabaseData, "object", "did not find the user");
        });

        testIt("should retrieve the returned ID", () => {
            testEqual(userDatabaseData.ID, generatedGuestResult.ID, "did not find the correct ID");
        });

        testIt("should retrieve a cookie value", () => {
            testEqual(isCookie(generatedGuestResult.cookie), true, "did not retrieve a cookie");
        });

        testIt("should get the guest status from the new user", () => {
            testEqual(userDatabaseData.status, user.getUserStatuses().STATUS_GUEST, "user has the wrong status");
        });
    });
};

module.exports = generateGuestUserUseCaseTest;