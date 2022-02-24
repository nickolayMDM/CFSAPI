const changeFolderPinStatusFactory = require("../../useCases/changeFolderPinStatus");
const addFolderFactory = require("../../useCases/addFolder");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");

const changeFolderPinStatusUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Change folder pin status use case test", () => {
        const addFolder = addFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const changeFolderPinStatus = changeFolderPinStatusFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        let folderEntity, userID;

        test.before(async () => {
            userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            folderEntity = await addFolder({
                name: "folder",
                userID
            });
        });

        test.it("should pin the folder", async () => {
            const folderData = await changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID,
                isPinned: true
            });
            const databaseFolderData = database.findOne({
                collectionData: folder.getCollectionData(),
                filter: {
                    ID: folderData.ID
                }
            });

            test.equal(databaseFolderData.isPinned, true, "Did not find the pinned folder in the database");
        });

        test.it("should unpin the folder", async () => {
            const folderData = await changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID,
                isPinned: false
            });
            const databaseFolderData = database.findOne({
                collectionData: folder.getCollectionData(),
                filter: {
                    ID: folderData.ID
                }
            });

            test.equal(databaseFolderData.isPinned, false, "Did not find the unpinned folder in the database");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(changeFolderPinStatus({
                folderID: folderEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";

            await test.rejects(changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an unauthorized user ID", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a folder ID", async () => {
            await test.rejects(changeFolderPinStatus({
                userID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect folder ID", async () => {
            const folderID = "Bob";

            await test.rejects(changeFolderPinStatus({
                userID,
                folderID,
                isPinned: false
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without the pin status", async () => {
            await test.rejects(changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect pin status", async () => {
            await test.rejects(changeFolderPinStatus({
                userID,
                folderID: folderEntity.ID,
                isPinned: "Bob"
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a folder in the database", async () => {
            const folderID = database.generateID({
                collectionName: folder.getCollectionData().name
            });

            await test.rejects(changeFolderPinStatus({
                userID,
                folderID,
                isPinned: true
            }), RequestError, "Did not receive an error");
        });
    });
};

module.exports = changeFolderPinStatusUseCaseTest;