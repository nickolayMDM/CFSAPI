const userAuthorization = require("../../entities/userAuthorizationEntity");
const user = require("../../entities/userEntity");

const userAuthorizationTest = (
    {
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
    }
) => {
    testDescribe("User Authorization Entity Test", () => {
        assertCollectionDataGetter({
            getterFunction: userAuthorization.getCollectionData
        });

        const buildUserAuthorization = userAuthorization.buildUserAuthorizationFactory({
            isID,
            isPopulatedString,
            isBoolean,
            isWithin,
            isMD5Hash
        });
        const userAuthorizationVariants = userAuthorization.getUserAuthorizationVariants();
        const userAuthorizationCollectionData = userAuthorization.getCollectionData();
        const ID = generateDatabaseID({
            collectionName: userAuthorizationCollectionData.name
        });
        const consistentBuildParameters = {
            userID: generateDatabaseID({
                collectionName: user.getCollectionData().name
            }),
            isActive: true
        };
        const passwordBuildParameters = {
            ...consistentBuildParameters,
            variant: userAuthorizationVariants.VARIANT_PASSWORD,
            token: "58d23eb435996dde710b8f42c1fa4025"
        };

        buildCorrectEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should build a password variant entity",
            buildParameters: {
                ...consistentBuildParameters,
                variant: userAuthorizationVariants.VARIANT_PASSWORD,
                token: "58d23eb435996dde710b8f42c1fa4025"
            }
        });

        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: passwordBuildParameters
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...passwordBuildParameters,
                ID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity without a userID",
            buildParameters: {
                ...passwordBuildParameters,
                userID: undefined
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an incorrect user ID",
            buildParameters: {
                ...passwordBuildParameters,
                userID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an invalid variant",
            buildParameters: {
                ...consistentBuildParameters,
                ID,
                variant: "Bob",
                token: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an invalid token for the password variant",
            buildParameters: {
                ...consistentBuildParameters,
                ID,
                variant: userAuthorizationVariants.VARIANT_PASSWORD,
                token: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with a non-boolean is active value",
            buildParameters: {
                ...passwordBuildParameters,
                ID,
                isActive: "Bob"
            }
        });


        getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: passwordBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get user ID from entity",
            expectedData: passwordBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: passwordBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get variant from entity",
            expectedData: passwordBuildParameters.variant,
            getFunctionName: "getVariant",
            buildParameters: passwordBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get token from entity",
            expectedData: passwordBuildParameters.token,
            getFunctionName: "getToken",
            buildParameters: passwordBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get is active boolean entity",
            expectedData: passwordBuildParameters.isActive,
            getFunctionName: "getIsActive",
            buildParameters: passwordBuildParameters
        });

        testIt("should receive user authorization variants object", () => {
            const variants = userAuthorization.getUserAuthorizationVariants();

            testEqual(typeof variants, "object", "Failed to get user authorization variants");
        });
    });
};

module.exports = userAuthorizationTest;