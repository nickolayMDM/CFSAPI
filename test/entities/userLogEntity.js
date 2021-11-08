const userLog = require("../../entities/userLogEntity");
const user = require("../../entities/userEntity");

const userLogTest = (
    {
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
    }
) => {
    testDescribe("User Log Entity Test", () => {
        assertCollectionDataGetter({
            getterFunction: userLog.getCollectionData
        });

        const buildUserLog = userLog.buildUserLogFactory(
            {
                isDefined,
                isID,
                isPopulatedString,
                isPopulatedObject,
                isTimestamp
            }
        );
        const userLogCollectionData = userLog.getCollectionData();
        const ID = generateDatabaseID({
            collectionName: userLogCollectionData.name
        });
        const fullBuildParameters = {
            userID: generateDatabaseID({
                collectionName: user.getCollectionData().name
            }),
            description: "Bob is testing",
            additional: {
                test: "data"
            }
        };

        buildCorrectEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should build a minimal entity",
            buildParameters: {
                userID: fullBuildParameters.userID,
                description: fullBuildParameters.description
            }
        });
        buildCorrectEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without a user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: undefined
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an invalid user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity without a description",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                description: undefined
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an empty description",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                description: ""
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUserLog,
            testName: "should throw an error when building an entity with an invalid date",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                timestamp: "Bob"
            }
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get user ID from entity",
            expectedData: fullBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: fullBuildParameters
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get description from entity",
            expectedData: fullBuildParameters.description,
            getFunctionName: "getDescription",
            buildParameters: fullBuildParameters
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUserLog,
            testName: "should get additional from entity",
            expectedData: fullBuildParameters.additional,
            getFunctionName: "getAdditional",
            buildParameters: fullBuildParameters
        });
        getEmptyFieldFromEntity({
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