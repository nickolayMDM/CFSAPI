const addFolderFactory = require("../../useCases/addFolder");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");

const addFolderUseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testBefore,
        testThrows,
        isDefined,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        isObject,
        generateDatabaseID,
        insertEntityIntoDatabase,
        findOneFromDatabase,
        transformEntityIntoASimpleObject
    }
) => {
    testDescribe("Add folder use case Test", () => {
        const addFolder = addFolderFactory({
            isDefined,
            isID,
            isPopulatedString,
            isPopulatedObject,
            isTimestamp,
            isNull,
            isBoolean,
            generateDatabaseID,
            findOneFromDatabase,
            insertEntityIntoDatabase,
            transformEntityIntoASimpleObject
        });
        let folderCollectionData, userCollectionData;

        testBefore(async () => {
            folderCollectionData = folder.getCollectionData();
            userCollectionData = user.getCollectionData();
        });

        testIt("should add a root folder", async () => {
            const name = "folder";
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });
            const folderData = await addFolder({
                name,
                userID
            });
            const databaseFolderData = findOneFromDatabase({
                collectionData: folderCollectionData,
                filter: {
                    ID: folderData.ID
                }
            });

            testEqual((isObject(databaseFolderData) && databaseFolderData.name === name), true, "did not find the folder in the database");
        });

        testIt("should add a parent folder", async () => {
            const parentName = "parent folder";
            const userID = generateDatabaseID({
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

            const databaseFolderData = findOneFromDatabase({
                collectionData: folderCollectionData,
                filter: {
                    ID: childFolderData.ID
                }
            });

            testEqual((isObject(databaseFolderData) && databaseFolderData.name === childName && databaseFolderData.parentID === parentFolderData.ID), true, "did not find the child folder in the database");
        });

        testIt("should throw an error without a name", async () => {
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });

            testThrows(addFolder.bind(this, {
                userID
            }), Error, "Did not receive an error when trying to add a folder without a name", true);
        });

        testIt("should throw an error with an incorrect name", async () => {
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });
            const name = {};

            testThrows(addFolder.bind(this, {
                name,
                userID
            }), Error, "Did not receive an error when trying to add a folder with an incorrect name", true);
        });

        testIt("should throw an error without an ID", async () => {
            const name = "folder";

            testThrows(addFolder.bind(this, {
                name
            }), Error, "Did not receive an error when trying to add a folder without an ID", true);
        });

        testIt("should throw an error with an incorrect ID", async () => {
            const userID = "Bob";
            const name = "folder";

            testThrows(addFolder.bind(this, {
                name,
                userID
            }), Error, "Did not receive an error when trying to add a folder with an incorrect ID", true);
        });

        testIt("should throw an error with an existing name", async () => {
            const userID = generateDatabaseID({
                collectionName: userCollectionData.name
            });
            const name = "existing folder";
            await addFolder({
                userID,
                name
            });

            const secondUserID = generateDatabaseID({
                collectionName: userCollectionData.name
            });

            testThrows(addFolder.bind(this, {
                name,
                userID: secondUserID
            }), Error, "Did not receive an error when trying to add a folder with an existing name", true);
        });
    });
};

module.exports = addFolderUseCaseTest;