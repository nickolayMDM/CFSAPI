const numberValidators = require("./numberValidators");

const isOkStatus = (value) => {
    return (numberValidators.isInt(value) && value >= 200 && value < 300);
};

module.exports = {isOkStatus};