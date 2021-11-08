const createUserSession = require("../../useCases/createUserSession");

const UseCaseTest = (
    {
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        isInt,
    }
) => {
    testDescribe("Create user session use case Test", () => {
        testIt("should store a new guest user", () => {

        });
    });
};

module.exports = UseCaseTest;