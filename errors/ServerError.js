class ServerError extends Error {
    constructor(message, additional) {
        super(message);
        this.additional = additional;
        this.code = 500;
        this.name = "ServerError";
    }
}

module.exports = ServerError;