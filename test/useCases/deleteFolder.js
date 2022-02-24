const deleteFolderFactory = require("../../useCases/deleteFolder");
const addFolderFactory = require("../../useCases/addFolder");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");

const deleteFolderUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Delete folder use case test", () => {
        const addFolder = addFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const deleteFolder = deleteFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const userID = database.generateID({
            collectionName: user.getCollectionData().name
        });

        test.before();

        test.it("should delete the folder", async () => {
            const folderData = await addFolder({
                name: "folder to delete",
                userID
            });
            await deleteFolder({
                userID,
                folderID: folderData.ID
            });

            const databaseFolderData = database.findOne({
                collectionData: folder.getCollectionData(),
                filter: {
                    ID: folderData.ID,
                    isDeleted: true
                }
            });

            test.equal(validators.isNull(databaseFolderData), false, "did not find the deleted folder in the database");
        });

        test.it("should throw an error when deleting a deleted folder", async () => {
            const folderData = await addFolder({
                name: "folder to delete with error 1",
                userID
            });
            await deleteFolder({
                userID,
                folderID: folderData.ID
            });

            await test.rejects(deleteFolder({
                userID,
                folderID: folderData.ID
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error without a user ID", async () => {
            const folderData = await addFolder({
                name: "folder to delete with error 2",
                userID
            });

            await test.rejects(deleteFolder({
                folderID: folderData.ID
            }), RequestError, "Did not receive a request error");
        });
        test.it("should throw an error with an unauthorized user ID", async () => {
            const folderData = await addFolder({
                name: "folder to delete with error 3",
                userID
            });
            const unauthorizedUserID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(deleteFolder({
                folderID: folderData.ID,
                userID: unauthorizedUserID
            }), RequestError, "Did not receive a request error");
        });

        test.it("should throw an error without a folder ID", async () => {
            await test.rejects(deleteFolder({
                userID
            }), RequestError, "Did not receive a request error");
        });
    });
};

module.exports = deleteFolderUseCaseTest;