const userAuthorization = require("../../entities/userAuthorizationEntity");
const user = require("../../entities/userEntity");

const userAuthorizationTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("User Authorization Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: userAuthorization.getCollectionData
        });

        const buildUserAuthorization = userAuthorization.buildUserAuthorizationFactory({
            validators,
            database
        });
        const userAuthorizationVariants = userAuthorization.getUserAuthorizationVariants();
        const userAuthorizationCollectionData = userAuthorization.getCollectionData();
        const ID = database.generateID({
            collectionName: userAuthorizationCollectionData.name
        });
        const consistentBuildParameters = {
            userID: database.generateID({
                collectionName: user.getCollectionData().name
            }),
            isActive: true
        };
        const passwordBuildParameters = {
            ...consistentBuildParameters,
            variant: userAuthorizationVariants.VARIANT_PASSWORD,
            token: "Bob",
            additional: {
                password: "58d23eb435996dde710b8f42c1fa4025"
            }
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should build a password variant entity",
            buildParameters: passwordBuildParameters
        });

        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: passwordBuildParameters
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...passwordBuildParameters,
                ID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity without a userID",
            buildParameters: {
                ...passwordBuildParameters,
                userID: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an incorrect user ID",
            buildParameters: {
                ...passwordBuildParameters,
                userID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an invalid variant",
            buildParameters: {
                ...consistentBuildParameters,
                ID,
                variant: "Bob",
                token: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with an invalid token for the password variant",
            buildParameters: {
                ...consistentBuildParameters,
                ID,
                variant: userAuthorizationVariants.VARIANT_PASSWORD,
                token: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserAuthorization,
            testName: "should throw an error when building an entity with a non-boolean is active value",
            buildParameters: {
                ...passwordBuildParameters,
                ID,
                isActive: "Bob"
            }
        });


        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: passwordBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get user ID from entity",
            expectedData: passwordBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: passwordBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get variant from entity",
            expectedData: passwordBuildParameters.variant,
            getFunctionName: "getVariant",
            buildParameters: passwordBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get token from entity",
            expectedData: passwordBuildParameters.token,
            getFunctionName: "getToken",
            buildParameters: passwordBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserAuthorization,
            testName: "should get is active boolean entity",
            expectedData: passwordBuildParameters.isActive,
            getFunctionName: "getIsActive",
            buildParameters: passwordBuildParameters
        });

        test.it("should receive user authorization variants object", () => {
            const variants = userAuthorization.getUserAuthorizationVariants();

            test.equal(typeof variants, "object", "Failed to get user authorization variants");
        });
    });
};

module.exports = userAuthorizationTest;