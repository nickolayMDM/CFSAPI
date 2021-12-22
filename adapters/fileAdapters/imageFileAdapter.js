const fileAdapter = require("../fileAdapter");
const validators = require("../../helpers/validators");
// const sharp = require("sharp");

const allowedExtensions = [
    "png", "jpg", "jpeg", "bmp", "gif"
];

class imageFile extends fileAdapter {
    //TODO: enable on a production server (disabled on glitch due to incompatibility)
    async resize({width, height}) {
        // let resizeParams = {};
        // if (typeof width === "number") {
        //     resizeParams.width = width;
        // }
        // if (typeof height === "number") {
        //     resizeParams.height = height;
        // }
        //
        // const resizedImage = await sharp(this._fileData).resize(resizeParams);
        // this._fileData = await resizedImage.toBuffer();

        return this;
    };

    fileDataIsValid() {
        return validators.isBuffer(this._fileData) && allowedExtensions.indexOf(this._extension) > -1;
    };
}

module.exports = imageFile;