const folder = require("../../entities/folderEntity");
const user = require("../../entities/userEntity");

const FolderTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("Folder Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: folder.getCollectionData
        });

        const buildFolder = folder.buildFolderFactory({
            validators,
            database
        });
        const folderCollectionData = folder.getCollectionData();
        const ID = database.generateID({
            collectionName: folderCollectionData.name
        });
        const fullBuildParameters = {
            userID: database.generateID({
                collectionName: user.getCollectionData().name
            }),
            name: "Bob's folder",
            parentID: database.generateID({
                collectionName: folderCollectionData.name
            }),
            isDeleted: true
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should build a minimal entity",
            buildParameters: {
                userID: fullBuildParameters.userID,
                name: fullBuildParameters.name
            }
        });
        test.buildCorrectEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity without a user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an incorrect user ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                userID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an empty name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: ""
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with a numeric name",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: 42
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an invalid parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildFolder,
            testName: "should throw an error when building an entity with an non-boolean isDeleted value",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                isDeleted: "Bob"
            }
        });


        test.getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get user ID from entity",
            expectedData: fullBuildParameters.userID,
            getFunctionName: "getUserID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get name from entity",
            expectedData: fullBuildParameters.name,
            getFunctionName: "getName",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get parent ID from entity",
            expectedData: fullBuildParameters.parentID,
            getFunctionName: "getParentID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildFolder,
            testName: "should get is deleted boolean from entity",
            expectedData: fullBuildParameters.isDeleted,
            getFunctionName: "getIsDeleted",
            buildParameters: fullBuildParameters
        });
    });
};

module.exports = FolderTest;