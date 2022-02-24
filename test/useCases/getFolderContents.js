const getFolderContentsFactory = require("../../useCases/getFolderContents");
const userEntity = require("../../entities/userEntity");
const folderEntity = require("../../entities/folderEntity");
const postEntity = require("../../entities/postEntity");

const getFolderContentsUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Get folder contents use case test", () => {
        const getFolderContents = getFolderContentsFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const userCollectionData = userEntity.getCollectionData();
        const folderCollectionData = folderEntity.getCollectionData();
        const postCollectionData = postEntity.getCollectionData();
        const user = {
            ID: database.generateID({collectionName: userCollectionData.name}),
            name: "Bob",
            email: "bobsemail@fake.mail",
            status: "guest"
        };
        const folder = {
            ID: database.generateID({collectionName: folderCollectionData.name}),
            userID: user.ID,
            name: "Bob's folder",
            isDeleted: false
        };
        const otherFolder = {
            ID: database.generateID({collectionName: folderCollectionData.name}),
            userID: user.ID,
            name: "Bob's other folder",
            isDeleted: false
        };
        const post = {
            ID: database.generateID({collectionName: postCollectionData.name}),
            userID: user.ID,
            folderID: folder.ID,
            isDeleted: false
        };
        const otherFolderPost = {
            ID: database.generateID({collectionName: postCollectionData.name}),
            userID: user.ID,
            folderID: otherFolder.ID,
            isDeleted: false
        };

        let rootContents, folderContents;

        test.before(async () => {
            database.insert({
                collectionData: folderCollectionData,
                data: otherFolder
            });
            database.insert({
                collectionData: postCollectionData,
                data: otherFolderPost
            });
            database.insert({
                collectionData: userCollectionData,
                data: user
            });
            database.insert({
                collectionData: folderCollectionData,
                data: folder
            });
            database.insert({
                collectionData: postCollectionData,
                data: post
            });

            rootContents = await getFolderContents({
                userID: user.ID
            });
            folderContents = await getFolderContents({
                userID: user.ID,
                folderID: folder.ID
            });
        });

        test.it("should get 2 user's root folders", async () => {
            test.equal(rootContents.folders.length, 2, "Did not find correct data");
        });

        test.it("should get 0 user's root posts", async () => {
            test.equal(rootContents.posts.length, 0, "Did not find correct data");
        });

        test.it("should get no folders in the user's folder", async () => {
            test.equal(folderContents.folders.length, 0, "Did not find correct data");
        });

        test.it("should get user's folder post", async () => {
            test.equal(folderContents.posts[0].ID, post.ID, "Did not find correct data");
        });

        test.it("should throw an error without a user ID", async () => {
            await test.rejects(getFolderContents, Error, "Did not receive an error when trying to get folder contents without a user ID");
        });
    });
};

module.exports = getFolderContentsUseCaseTest;