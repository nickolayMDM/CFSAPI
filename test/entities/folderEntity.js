const folder = require("../../entities/folderEntity");
const user = require("../../entities/userEntity");

const FolderTest = (
    {
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
    }
) => {
    testDescribe("Folder Entity Test", () => {
        assertCollectionDataGetter({
            getterFunction: folder.getCollectionData
        });

        const buildFolder = folder.buildFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isBoolean
        });
        const folderCollectionData = folder.getCollectionData();
        const ID = generateDatabaseID({
            collectionName: folderCollectionData.name
        });
        const fullBuildParameters = {
            userID: generateDatabaseID({
                collectionName: user.getCollectionData().name
            }),
            name: "Bob's folder",
            parentID: generateDatabaseID({
                collectionName: folderCollectionData.name
            }),
            isDeleted: true
        };

        buildCorrectEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should build a minimal entity",
            buildParameters: {
                userID: fullBuildParameters.userID,
                name: fullBuildParameters.name
            }
        });
        buildCorrectEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity without a user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: undefined
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an incorrect user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an empty name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: ""
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with a numeric name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: 42
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an invalid parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: "Bob"
            }
        });
        buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an non-boolean isDeleted value",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                isDeleted: "Bob"
            }
        });


        getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get user ID from entity",
            expectedData: fullBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get name from entity",
            expectedData: fullBuildParameters.name,
            getFunctionName: "getName",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get parent ID from entity",
            expectedData: fullBuildParameters.parentID,
            getFunctionName: "getParentID",
            buildParameters: fullBuildParameters
        });
        getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get is deleted boolean from entity",
            expectedData: fullBuildParameters.isDeleted,
            getFunctionName: "isDeleted",
            buildParameters: fullBuildParameters
        });
    });
};

module.exports = FolderTest;