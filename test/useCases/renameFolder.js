const userEntity = require("../../entities/userEntity");
const folderEntity = require("../../entities/folderEntity");
const renameFolderFactory = require("../../useCases/renameFolder");

const renameFolderUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Rename folder use case Test", () => {
        const renameFolder = renameFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        let folder, user;

        test.before(async () => {
            const buildUser = userEntity.buildUserFactory({
                validators,
                database
            });
            const buildFolder = folderEntity.buildFolderFactory({
                validators,
                database
            });

            user = buildUser({
                ID: database.generateID({
                    collectionName: userEntity.getCollectionData().name
                }),
                name: "Bob",
                email: "bobsemail@fake.mail",
                status: userEntity.getUserStatuses().STATUS_AUTHORIZED
            });
            folder = buildFolder({
                ID: database.generateID({
                    collectionName: folderEntity.getCollectionData().name
                }),
                userID: user.getID(),
                name: "Bob's folder"
            });

            await database.insertEntity({
                collectionData: userEntity.getCollectionData(),
                entityData: user
            });
            await database.insertEntity({
                collectionData: folderEntity.getCollectionData(),
                entityData: folder
            });
        });

        test.it("should rename the folder", async () => {
            const newName = "Bob's folder renamed";
            await renameFolder({
                name: newName,
                userID: user.getID(),
                folderID: folder.getID()
            });

            const newFolderData = await database.findOne({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    ID: folder.getID(),
                    userID: user.getID(),
                    isDeleted: false
                }
            });

            test.equal(newFolderData.name, newName, "Did not find correct data");
        });

        test.it("should throw an error without a new name", async () => {
            await test.rejects(renameFolder({
                userID: user.getID(),
                folderID: folder.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect new name", async () => {
            await test.rejects(renameFolder({
                name: {},
                userID: user.getID(),
                folderID: folder.getID()
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(renameFolder({
                name: "Bob's folder renamed with error",
                folderID: folder.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with a non-existent user", async () => {
            await test.rejects(renameFolder({
                name: "Bob's folder renamed with error",
                userID: database.generateID({
                    collectionName: userEntity.getCollectionData().name
                }),
                folderID: folder.getID()
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a folder ID", async () => {
            await test.rejects(renameFolder({
                name: "Bob's folder renamed with error",
                userID: user.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with a non-existent folder", async () => {
            await test.rejects(renameFolder({
                name: "Bob's folder renamed with error",
                userID: user.getID(),
                folderID: database.generateID({
                    collectionName: folderEntity.getCollectionData().name
                })
            }), RequestError, "Did not receive an error");
        });
    });
};

module.exports = renameFolderUseCaseTest;