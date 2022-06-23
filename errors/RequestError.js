const validators = require("../helpers/validators");
const GenericError = require("./GenericError");

class RequestError extends GenericError {
    constructor(message, payload, name) {
        super(message, payload);
        this.code = 400;
        this.name = (validators.isPopulatedString(name)) ? name : "RequestError";
    }
}

module.exports = RequestError;