const userLog = require("../../entities/userLogEntity");
const user = require("../../entities/userEntity");

const userLogTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("User Log Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: userLog.getCollectionData
        });

        const buildUserLog = userLog.buildUserLogFactory(
            {
                validators,
                database
            }
        );
        const userLogCollectionData = userLog.getCollectionData();
        const ID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const fullBuildParameters = {
            userID: database.generateID({
                collectionName: user.getCollectionData().name
            }),
            description: "Bob is testing",
            additional: {
                test: "data"
            }
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should build a minimal entity",
            buildParameters: {
                userID: fullBuildParameters.userID,
                description: fullBuildParameters.description
            }
        });
        test.buildCorrectEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without a user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an invalid user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without a description",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                description: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an empty description",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                description: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an invalid date",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                timestamp: "Bob"
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get user ID from entity",
            expectedData: fullBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get description from entity",
            expectedData: fullBuildParameters.description,
            getFunctionName: "getDescription",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get additional from entity",
            expectedData: fullBuildParameters.additional,
            getFunctionName: "getAdditional",
            buildParameters: fullBuildParameters
        });
        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should throw an error when getting an undefined additional data from entity",
            getFunctionName: "getAdditional",
            buildParameters: {
                ...fullBuildParameters,
                additional: undefined
            }
        });
    });
};

module.exports = userLogTest;