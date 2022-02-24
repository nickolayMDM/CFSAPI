const getSimpleFolderTreeFactory = require("../../useCases/getSimpleFolderTree");
const user = require("../../entities/userEntity");
const folder = require("../../entities/folderEntity");

const getInputDetailsUseCaseTest = (
    {
        test,
        validators,
        database,
        RequestError
    }
) => {
    test.describe("Get simple folder tree use case test", () => {
        const getSimpleFolderTree = getSimpleFolderTreeFactory({
            validators,
            database,
            RequestError
        });
        const buildFolder = folder.buildFolderFactory({
            validators,
            database
        });
        let userEntity;

        const addFolderToDatabase = async (folderData) => {
            const folderEntity = buildFolder(folderData);

            await database.insertEntity({
                collectionData: folder.getCollectionData(),
                entityData: folderEntity
            });

            return folderEntity;
        };

        test.before(async () => {
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
        });

        test.it("should return a single root folder", async () => {
            const simpleFolderTree = await getSimpleFolderTree({
                userID: userEntity.getID()
            });

            test.equal((validators.isPopulatedObject(simpleFolderTree) && !validators.isPopulatedArray(simpleFolderTree.children)), true, "Did not receive correct data");
        });

        test.it("should return a tree two levels deep", async () => {
            const level1Folder = await addFolderToDatabase({
                ID: database.generateID({
                    collectionName: folder.getCollectionData().name
                }),
                userID: userEntity.getID(),
                name: "Level 1 folder"
            });
            const level2Folder = await addFolderToDatabase({
                ID: database.generateID({
                    collectionName: folder.getCollectionData().name
                }),
                userID: userEntity.getID(),
                name: "Level 2 folder",
                parentID: level1Folder.getID()
            });

            const simpleFolderTree = await getSimpleFolderTree({
                userID: userEntity.getID()
            });

            test.equal((validators.isPopulatedObject(simpleFolderTree) && simpleFolderTree.children[0].ID === level1Folder.getID() && simpleFolderTree.children[0].children[0].ID === level2Folder.getID()), true, "Did not receive correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(getSimpleFolderTree(), RequestError, "Did not receive an error");
        });
        test.it("should throw an error with an incorrect user ID", async () => {
            const userID = "Bob";

            await test.rejects(getSimpleFolderTree({
                userID
            }), RequestError, "Did not receive an error");
        });
        test.it("should throw an error without a user in the database", async () => {
            const userID = database.generateID({
                collectionName: user.getCollectionData().name
            });

            await test.rejects(getSimpleFolderTree({
                userID
            }), RequestError, "Did not receive an error");
        });
    });
};

module.exports = getInputDetailsUseCaseTest;