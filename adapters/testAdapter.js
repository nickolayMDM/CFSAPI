const { describe, it, before, beforeEach } = require("mocha");
const assert  = require("assert");
const { isObjectType } = require("../helpers/validators");

const equal = (actual, expected, message) => {
    if (isObjectType(expected)) {
        return assert.deepStrictEqual(actual, expected, message);
    }

    assert.strictEqual(actual, expected, message);
};

const notEqual = (actual, expected, message) => {
    if (isObjectType(expected)) {
        return assert.notDeepStrictEqual(actual, expected, message);
    }

    assert.notStrictEqual(actual, expected, message);
};

const throws = (fn, error, message, isAsync = false) => {
    if (isAsync) {
        return assert.rejects(fn, error, message);
    }

    return assert.throws(fn, error, message);
};

module.exports = { describe, it, equal, notEqual, throws, before, beforeEach };