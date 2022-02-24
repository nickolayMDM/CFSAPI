const moveFolderFactory = require("../../useCases/moveFolder");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");

const moveFolderUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("move folder use case test", () => {
        const moveFolder = moveFolderFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        let userEntity, folderEntity, parentFolderEntity;

        const _addUserToDatabase = async () => {
            const buildUser = user.buildUserFactory({
                validators,
                database
            });

            userEntity = buildUser({
                ID: database.generateID({
                    collectionName: user.getCollectionData().name
                })
            });

            await database.insertEntity({
                collectionData: user.getCollectionData(),
                entityData: userEntity
            });
        };
        const _addFolderToDatabase = async () => {
            const buildFolder = folder.buildFolderFactory({
                validators,
                database
            });
            folderEntity = buildFolder({
                ID: database.generateID({
                    collectionName: folder.getCollectionData().name
                }),
                userID: userEntity.getID(),
                name: "folder"
            });

            await database.insertEntity({
                collectionData: folder.getCollectionData(),
                entityData: folderEntity
            });
        };
        const _addParentFolderToDatabase = async () => {
            const buildFolder = folder.buildFolderFactory({
                validators,
                database
            });
            parentFolderEntity = buildFolder({
                ID: database.generateID({
                    collectionName: folder.getCollectionData().name
                }),
                userID: userEntity.getID(),
                name: "parent folder"
            });

            await database.insertEntity({
                collectionData: folder.getCollectionData(),
                entityData: parentFolderEntity
            });
        };

        test.before(async () => {
            await _addUserToDatabase();
            await _addFolderToDatabase();
            await _addParentFolderToDatabase();
        });

        test.it("should move the folder to parent", async () => {
            await moveFolder({
                userID: userEntity.getID(),
                folderID: folderEntity.getID(),
                parentID: parentFolderEntity.getID()
            });

            const databaseFolderData = database.findOne({
                collectionData: folder.getCollectionData(),
                filter: {
                    ID: folderEntity.getID(),
                    parentID: parentFolderEntity.getID()
                }
            });

            test.equal(validators.isNull(databaseFolderData), false, "Did not receive correct data");
        });
        test.it("should move the folder to root", async () => {
            await moveFolder({
                userID: userEntity.getID(),
                folderID: folderEntity.getID()
            });

            const databaseFolderData = database.findOne({
                collectionData: folder.getCollectionData(),
                filter: {
                    ID: folderEntity.getID()
                }
            });

            test.equal(database.isID(databaseFolderData.parentID), false, "Did not receive correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(moveFolder({
                folderID: folderEntity.getID(),
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";

            await test.rejects(moveFolder({
                userID,
                folderID: folderEntity.getID(),
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an unauthorized user ID", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(moveFolder({
                userID,
                folderID: folderEntity.getID(),
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error without a user in the database", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(moveFolder({
                userID,
                folderID: folderEntity.getID(),
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error without a folder ID", async () => {
            await test.rejects(moveFolder({
                userID: userEntity.getID(),
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect folder ID", async () => {
            const folderID = "Bob";

            await test.rejects(moveFolder({
                userID: userEntity.getID(),
                folderID,
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error without a folder in the database", async () => {
            const folderID = database.generateID({
                collectionName: folder.getCollectionData().name
            });

            await test.rejects(moveFolder({
                userID: userEntity.getID(),
                folderID,
                parentID: parentFolderEntity.getID()
            }), RequestError, "Did not receive an error");
        });

        test.it("should throw an error with an incorrect parent ID", async () => {
            const parentID = "Bob";

            await test.rejects(moveFolder({
                userID: userEntity.getID(),
                folderID: folderEntity.getID(),
                parentID
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error without a parent in the database", async () => {
            const parentID = database.generateID({
                collectionName: folder.getCollectionData().name
            });

            await test.rejects(moveFolder({
                userID: userEntity.getID(),
                folderID: folderEntity.getID(),
                parentID
            }), RequestError, "Did not receive an error");
        });
    });
};

module.exports = moveFolderUseCaseTest;