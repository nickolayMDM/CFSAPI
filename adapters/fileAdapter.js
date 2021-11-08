const fs = require("fs").promises;
const path = require("path");
const validators = require("../helpers/validators");
const mimeTypes = require('mime-types');
const requestAdapter = require("./requestAdapter");

class file {
    constructor() {
        this._fileData = null;
        this._path = null;
        this._extension = null;
    }

    fileDataIsValid() {
        return validators.isBuffer(this._fileData);
    };

    async setFromUrl(url) {
        const requestResult = await requestAdapter.getFile({
            url
        });
        if (requestResult.error) {
            throw new Error(requestResult.error);
        }

        this._fileData = requestResult.response;
        this._extension = mimeTypes.extension(requestResult.headers["content-type"]);

        return this;
    };

    async setFromPath(path) {
        if (validators.isArray(path)) {
            path = path.join("/");
        }

        this._fileData = await fs.readFile(path);
        this._path = path;
        this._extension = mimeTypes.lookup(path);

        return this;
    };

    setFromString(string) {
        this._fileData = string;

        return this;
    };

    returnString() {
        return this._fileData;
    };

    returnPath() {
        return this._path;
    };

    returnExtension() {
        return this._extension;
    };

    async saveToPath(publicPath) {
        if (!this.fileDataIsValid()) {
            throw new Error("Can not save an invalid file");
        }
        let realPath = "./" + publicPath;
        realPath = realPath.replace("//", "/");

        await fs.mkdir(path.dirname(realPath), {recursive: true});
        await fs.writeFile(realPath, this._fileData);
        this._path = publicPath;

        return this;
    };
}

module.exports = file;