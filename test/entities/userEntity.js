const user = require("../../entities/userEntity");

const userTest = (
    {
        test,
        validators,
        database
    }
) => {
    test.describe("User Entity Test", () => {
        test.assertCollectionDataGetter({
            getterFunction: user.getCollectionData
        });

        const buildUser = user.buildUserFactory({
            validators,
            database
        });
        const userStatuses = user.getUserStatuses();
        const userSubscriptions = user.getUserSubscriptions();
        const userCollectionData = user.getCollectionData();
        const ID = database.generateID({
            collectionName: userCollectionData.name
        });
        const subscriptionEndTimestamp = Date.now() + 24 * 60 * 60 * 1000;
        const fullBuildParameters = {
            name: "Bob",
            email: "bobistesting@test.mail",
            status: userStatuses.STATUS_MERGED,
            subscriptionType: userSubscriptions.SUBSCRIPTION_PAID,
            subscriptionEndTimestamp: subscriptionEndTimestamp,
            parentID: database.generateID({
                collectionName: userCollectionData.name
            })
        };

        test.buildCorrectEntity({
            ID,
            buildEntity: buildUser,
            testName: "should build a minimal entity"
        });
        test.buildCorrectEntity({
            ID,
            buildEntity: buildUser,
            testName: "should build a full entity",
            buildParameters: fullBuildParameters
        });

        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity without an ID",
            buildParameters: fullBuildParameters
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an incorrect ID",
            buildParameters: {
                ...fullBuildParameters,
                ID: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a name with less than 3 characters",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: "Bo"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a name that is not a string",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                name: 42
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an invalid email",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                email: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an invalid status",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                status: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a 'merged' status and without a parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: undefined
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with own ID as a parent ID",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                parentID: ID
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an incorrect subscription data type",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                subscriptionType: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with an incorrect subscription type",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                subscriptionType: "Bob"
            }
        });
        test.buildIncorrectEntity({
            buildEntity: buildUser,
            testName: "should throw an error when building an entity with a paid subscription without the end timestamp",
            buildParameters: {
                ...fullBuildParameters,
                ID,
                subscriptionEndTimestamp: undefined
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get ID from entity",
            expectedData: ID,
            getFunctionName: "getID",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get name from entity",
            expectedData: fullBuildParameters.name,
            getFunctionName: "getName",
            buildParameters: fullBuildParameters
        });
        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined name from entity",
            getFunctionName: "getName",
            buildParameters: {
                ...fullBuildParameters,
                name: undefined
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get email from entity",
            expectedData: fullBuildParameters.email,
            getFunctionName: "getEmail",
            buildParameters: fullBuildParameters
        });
        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined email from entity",
            getFunctionName: "getEmail",
            buildParameters: {
                ...fullBuildParameters,
                email: undefined
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get status from entity",
            expectedData: fullBuildParameters.status,
            getFunctionName: "getStatus",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get parent ID from entity",
            expectedData: fullBuildParameters.parentID,
            getFunctionName: "getParentID",
            buildParameters: fullBuildParameters
        });
        test.getEmptyFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should throw an error when getting an undefined parentID from entity",
            getFunctionName: "getParentID",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_GUEST,
                parentID: undefined
            }
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get active as true from entity",
            expectedData: true,
            getFunctionName: "getIsActive",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_AUTHORIZED,
                parentID: undefined
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get active as false from entity",
            expectedData: false,
            getFunctionName: "getIsActive",
            buildParameters: fullBuildParameters
        });

        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get merged as false from entity",
            expectedData: false,
            getFunctionName: "getIsMerged",
            buildParameters: {
                ...fullBuildParameters,
                status: userStatuses.STATUS_GUEST,
                parentID: undefined
            }
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get merged as true from entity",
            expectedData: true,
            getFunctionName: "getIsMerged",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get subscription type from entity",
            expectedData: userSubscriptions.SUBSCRIPTION_PAID,
            getFunctionName: "getSubscriptionType",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get subscription end timestamp from entity",
            expectedData: subscriptionEndTimestamp,
            getFunctionName: "getSubscriptionEndTimestamp",
            buildParameters: fullBuildParameters
        });
        test.getFieldFromEntity({
            ID,
            buildEntity: buildUser,
            testName: "should get subscription default type with outdated timestamp",
            expectedData: userSubscriptions.SUBSCRIPTION_FREE,
            getFunctionName: "getSubscriptionType",
            buildParameters: {
                ...fullBuildParameters,
                subscriptionEndTimestamp: Date.now() - 24 * 60 * 60 * 1000
            }
        });

        test.it("should receive user statuses object", () => {
            const statuses = user.getUserStatuses();

            test.equal(typeof statuses, "object", "Failed to get user statuses");
        });

        test.it("should receive user subscriptions object", () => {
            const statuses = user.getUserSubscriptions();

            test.equal(typeof statuses, "object", "Failed to get user subscriptions");
        });
    });
};

module.exports = userTest;