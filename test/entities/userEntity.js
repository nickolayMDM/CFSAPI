const user = require("../../entities/userEntity");

const userTest = ({
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
}) => {
    testDescribe("User Entity Test", () => {
        assertCollectionDataGetter({
            getterFunction: user.getCollectionData
        });

        const buildUser = user.buildUserFactory({
            isDefined,
            isEmail,
            isWithin,
            isID
        });
        const userStatuses = user.getUserStatuses();
        const userCollectionData = user.getCollectionData();
        const ID = generateDatabaseID({
            collectionName: userCollectionData.name
        });
        const fullBuildParameters = {
            name: "Bob",
            email: "bobistesting@test.mail",
            status: userStatuses.STATUS_MERGED,
            parentID: generateDatabaseID({
                collectionName: userCollectionData.name
            })
        };

        buildCorrectEntity({
            ID,
            buildEntity: buildUser,
            testName: "should build a minimal entity"
        });
        buildCorrectEntity({
            ID,
            buildEntity: buildUser,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a name with less than 3 characters",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: "Bo"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a name that is not a string",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: 42
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an invalid email",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                email: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an invalid status",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                status: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a parent ID and not a 'merged' status",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                status: userStatuses.STATUS_GUEST
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a 'merged' status and without a parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: undefined
            }
        });
        buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with own ID as a parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: ID
            }
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get name from entity",
            expectedData: fullBuildParameters.name,
            getFunctionName: "getName",
            buildParameters: fullBuildParameters
        });
        getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined name from entity",
            getFunctionName: "getName",
            buildParameters: {
                ...fullBuildParameters,
                name: undefined
            }
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get email from entity",
            expectedData: fullBuildParameters.email,
            getFunctionName: "getEmail",
            buildParameters: fullBuildParameters
        });
        getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined email from entity",
            getFunctionName: "getEmail",
            buildParameters: {
                ...fullBuildParameters,
                email: undefined
            }
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get status from entity",
            expectedData: fullBuildParameters.status,
            getFunctionName: "getStatus",
            buildParameters: fullBuildParameters
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get parent ID from entity",
            expectedData: fullBuildParameters.parentID,
            getFunctionName: "getParentID",
            buildParameters: fullBuildParameters
        });
        getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined parentID from entity",
            getFunctionName: "getParentID",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_GUEST,
                parentID: undefined
            }
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get active as true from entity",
            expectedData: true,
            getFunctionName: "isActive",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_AUTHORIZED,
                parentID: undefined
            }
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get active as false from entity",
            expectedData: false,
            getFunctionName: "isActive",
            buildParameters: fullBuildParameters
        });

        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get merged as false from entity",
            expectedData: false,
            getFunctionName: "isMerged",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_GUEST,
                parentID: undefined
            }
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get merged as true from entity",
            expectedData: true,
            getFunctionName: "isMerged",
            buildParameters: fullBuildParameters
        });

        testIt("should receive user statuses object", () => {
            const statuses = user.getUserStatuses();

            testEqual(typeof statuses, "object", "Failed to get user statuses");
        });
    });
};

module.exports = userTest;