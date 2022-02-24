const GenericError = require("./GenericError");

class RequestError extends GenericError {
    constructor(message, payload) {
        super(message, payload);
        this.code = 400;
        this.name = "RequestError";
    }
}

module.exports = RequestError;