const serverLog = require("../../entities/serverLogEntity");

const serverLogTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("Server Log Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: serverLog.getCollectionData
        });

        const buildServerLog = serverLog.buildServerLogFactory(
            {
                validators,
                database
            }
        );
        const serverLogCollectionData = serverLog.getCollectionData();
        const ID = database.generateID({
            collectionName: serverLogCollectionData.name
        });
        const fullBuildParameters = {
            name: "Bob's server log name",
            message: "Bob's server log message",
            stack: "Bob's server log stack",
            payload: {
                additional: "data"
            }
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should build a minimal entity",
            buildParameters: {
                name: "Bob's server log name",
                message: "Bob's server log message",
                stack: "Bob's server log stack"
            }
        });
        test.buildCorrectEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity without a name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with an empty name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity without a message",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                message: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with an empty message",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                message: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity without a stack",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                stack: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with an empty stack",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                stack: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with an invalid date",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                timestamp: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildServerLog,
            testName: "should throw an error when building an entity with a non-object payload value",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                payload: "Bob"
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should get name from entity",
            expectedData: fullBuildParameters.name,
            getFunctionName: "getName",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should get message from entity",
            expectedData: fullBuildParameters.message,
            getFunctionName: "getMessage",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should get stack from entity",
            expectedData: fullBuildParameters.stack,
            getFunctionName: "getStack",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should get payload from entity",
            expectedData: fullBuildParameters.payload,
            getFunctionName: "getPayload",
            buildParameters: fullBuildParameters
        });

        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildServerLog,
            testName: "should throw an error when getting an undefined payload data from entity",
            getFunctionName: "getPayload",
            buildParameters: {
                ...fullBuildParameters,
                payload: undefined
            }
        });
    });
};

module.exports = serverLogTest;