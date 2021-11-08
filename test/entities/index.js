const runUserTest = require("./userEntity");
const runUserLogTest = require("./userLogEntity");
const runUserAuthorizationTest = require("./userAuthorizationEntity");
const runFolderTest = require("./folderEntity");
const runPostTest = require("./postEntity");

const run = async (
    {
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        isDefined,
        isEmail,
        isWithin,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isBoolean,
        isMD5Hash,
        isJsonString,
        isUrl,
        isTimestamp,
        generateDatabaseID
    }
) => {
    const buildCorrectEntity = ({ID, buildEntity, buildParameters = {}, testName} = {}) => {
        testIt(testName, () => {
            const entity = buildEntity({
                ID,
                ...buildParameters
            });
            const actualID = entity.getID();

            testEqual(actualID, ID, "Failed to build the entity");
        });
    };
    const buildIncorrectEntity = ({buildEntity, buildParameters = {}, testName} = {}) => {
        testIt(testName, () => {
            const entityData = {
                ...buildParameters
            };

            testThrows(buildEntity.bind(this, entityData), Error, "Failed to receive an error with a faulty entity");
        });
    };

    const getFieldFromEntity = ({ID, buildEntity, expectedData, getFunctionName, buildParameters = {}, testName}) => {
        testIt(testName, () => {
            const actualEntityData = {
                ID,
                ...buildParameters
            };
            const entity = buildEntity(actualEntityData);
            const actualData = entity[getFunctionName]();

            testEqual(actualData, expectedData, "Failed to retrieve entity data");
        });
    };
    const getEmptyFieldFromEntity = ({ID, buildEntity, getFunctionName, buildParameters = {}, testName}) => {
        testIt(testName, () => {
            const entity = buildEntity({
                ...buildParameters,
                ID
            });

            testEqual(typeof entity[getFunctionName], "undefined", "Failed to receive an error when calling an undefined getter");
        });
    };

    const assertCollectionDataGetter = ({getterFunction}) => {
        testIt("should get collection data", () => {
            const collectionData = getterFunction();

            testEqual(typeof collectionData.name, "string", "Failed to get user collection data");
        });
    };

    runUserTest({
        buildCorrectEntity,
        buildIncorrectEntity,
        getFieldFromEntity,
        getEmptyFieldFromEntity,
        assertCollectionDataGetter,
        testDescribe,
        testIt,
        testEqual,
        isDefined,
        isEmail,
        isWithin,
        isID,
        generateDatabaseID
    });

    runUserLogTest({
        buildCorrectEntity,
        buildIncorrectEntity,
        getFieldFromEntity,
        getEmptyFieldFromEntity,
        assertCollectionDataGetter,
        testDescribe,
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID
    });

    runUserAuthorizationTest({
        buildCorrectEntity,
        buildIncorrectEntity,
        getFieldFromEntity,
        assertCollectionDataGetter,
        testDescribe,
        testIt,
        testEqual,
        isID,
        isPopulatedString,
        isBoolean,
        isWithin,
        isMD5Hash,
        generateDatabaseID
    });

    runFolderTest({
        buildCorrectEntity,
        buildIncorrectEntity,
        getFieldFromEntity,
        assertCollectionDataGetter,
        testDescribe,
        isDefined,
        isID,
        isPopulatedString,
        isBoolean,
        generateDatabaseID
    });

    runPostTest({
        buildCorrectEntity,
        buildIncorrectEntity,
        getFieldFromEntity,
        getEmptyFieldFromEntity,
        assertCollectionDataGetter,
        testDescribe,
        isDefined,
        isID,
        isPopulatedString,
        isBoolean,
        isJsonString,
        isUrl,
        generateDatabaseID
    });
};

module.exports = run;