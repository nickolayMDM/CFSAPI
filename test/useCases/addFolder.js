const addFolderFactory = require("../../useCases/addFolder");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");
const config = require("../../config");

const addFolderUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Add folder use case Test", () => {
        const addFolder = addFolderFactory({
            validators,
            database,
            objectHelpers,
            config,
            RequestError
        });
        let folderCollectionData, userCollectionData;

        test.before(async () => {
            folderCollectionData = folder.getCollectionData();
            userCollectionData = user.getCollectionData();
        });

        test.it("should add a root folder", async () => {
            const name = "folder";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const folderData = await addFolder({
                name,
                userID
            });
            const databaseFolderData = database.findOne({
                collectionData: folderCollectionData,
                filter: {
                    ID: folderData.ID
                }
            });

            test.equal((validators.isObject(databaseFolderData) && databaseFolderData.name === name), true, "did not find the folder in the database");
        });

        test.it("should add a parent folder", async () => {
            const parentName = "parent folder";
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const parentFolderData = await addFolder({
                name: parentName,
                userID
            });

            const childName = "child folder";
            const childFolderData = await addFolder({
                name: childName,
                userID,
                parentID: parentFolderData.ID
            });

            const databaseFolderData = database.findOne({
                collectionData: folderCollectionData,
                filter: {
                    ID: childFolderData.ID
                }
            });

            test.equal((validators.isObject(databaseFolderData) && databaseFolderData.name === childName && databaseFolderData.parentID === parentFolderData.ID), true, "did not find the child folder in the database");
        });

        test.it("should throw an error without a name", async () => {
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });

            await test.rejects(addFolder({
                userID,
            }), RequestError, "Did not receive an error when trying to add a folder without a name");
        });

        test.it("should throw an error with an incorrect name", async () => {
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const name = {};

            await test.rejects(addFolder({
                name,
                userID
            }), RequestError, "Did not receive an error when trying to add a folder with an incorrect name");
        });
        test.it("should throw an error with an existing name", async () => {
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const name = "existing folder";
            await addFolder({
                userID,
                name
            });

            await test.rejects(addFolder({
                name,
                userID
            }), RequestError, "Did not receive an error when trying to add a folder with an existing name");
        });

        test.it("should throw an error without a user ID", async () => {
            const name = "folder";

            await test.rejects(addFolder({
                name
            }), RequestError, "Did not receive an error when trying to add a folder without an user ID");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";
            const name = "folder";

            await test.rejects(addFolder({
                name,
                userID
            }), RequestError, "Did not receive an error when trying to add a folder with an incorrect user ID");
        });

        test.it("should throw an error with an incorrect parent ID", async () => {
            const userID = database.generateID({
                collectionName: userCollectionData.name
            });
            const name = "folder";
            const parentID = "Bob";

            await test.rejects(addFolder({
                name,
                userID,
                parentID
            }), RequestError, "Did not receive an error when trying to add a folder with an incorrect parent ID");
        });
    });
};

module.exports = addFolderUseCaseTest;