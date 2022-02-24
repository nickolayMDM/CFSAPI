class GenericError extends Error {
    constructor(message, payload) {
        super(message);
        this.payload = payload;
        this.code = 0;
        this.name = "GenericError";
    }
}

module.exports = GenericError;