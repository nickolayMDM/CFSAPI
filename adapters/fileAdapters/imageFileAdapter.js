const fileAdapter = require("../fileAdapter");
const sharp = require("sharp");

//TODO: make sure the loaded file is an image
class imageFile extends fileAdapter {
    async resize({width, height}) {
        let resizeParams = {};
        if (typeof width === "number") {
            resizeParams.width = width;
        }
        if (typeof height === "number") {
            resizeParams.height = height;
        }

        const resizedImage = await sharp(this._fileData).resize(resizeParams);
        this._fileData = await resizedImage.toBuffer();

        return this;
    };
}

module.exports = imageFile;