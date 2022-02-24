const runUserTest = require("./userEntity");
const runUserLogTest = require("./userLogEntity");
const runUserAuthorizationTest = require("./userAuthorizationEntity");
const runFolderTest = require("./folderEntity");
const runPostTest = require("./postEntity");
const runServerLogTest = require("./serverLogEntity");
const runPaymentTest = require("./paymentEntity");

const run = async (
    {
        test,
        validators,
        database
    }
) => {
    let entityTest = {
        ...test,
        buildCorrectEntity: ({ID, buildEntity, buildParameters = {}, testName} = {}) => {
            test.it(testName, () => {
                const entity = buildEntity({
                    ID,
                    ...buildParameters
                });
                const actualID = entity.getID();

                test.equal(actualID, ID, "Failed to build the entity");
            });
        },
        buildIncorrectEntity: ({buildEntity, buildParameters = {}, testName} = {}) => {
            test.it(testName, () => {
                const entityData = {
                    ...buildParameters
                };

                test.throws(buildEntity.bind(this, entityData), Error, "Failed to receive an error with a faulty entity");
            });
        },
        getFieldFromEntity: ({ID, buildEntity, expectedData, getFunctionName, buildParameters = {}, testName}) => {
            test.it(testName, () => {
                const actualEntityData = {
                    ID,
                    ...buildParameters
                };
                const entity = buildEntity(actualEntityData);
                const actualData = entity[getFunctionName]();

                test.equal(actualData, expectedData, "Failed to retrieve entity data");
            });
        },
        getEmptyFieldFromEntity: ({ID, buildEntity, getFunctionName, buildParameters = {}, testName}) => {
            test.it(testName, () => {
                const entity = buildEntity({
                    ...buildParameters,
                    ID
                });

                test.equal(typeof entity[getFunctionName], "undefined", "Failed to receive an error when calling an undefined getter");
            });
        },
        assertCollectionDataGetter: ({getterFunction}) => {
            test.it("should get collection data", () => {
                const collectionData = getterFunction();

                test.equal(typeof collectionData.name, "string", "Failed to get user collection data");
            });
        }
    };

    runUserTest({
        test: entityTest,
        validators,
        database
    });

    runUserLogTest({
        test: entityTest,
        validators,
        database
    });

    runUserAuthorizationTest({
        test: entityTest,
        validators,
        database
    });

    runFolderTest({
        test: entityTest,
        validators,
        database
    });

    runPostTest({
        test: entityTest,
        validators,
        database
    });

    runServerLogTest({
        test: entityTest,
        validators,
        database
    });

    runPaymentTest({
        test: entityTest,
        validators,
        database
    });
};

module.exports = run;