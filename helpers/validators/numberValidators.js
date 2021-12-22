const isNonNegativeInteger = (value) => {
    return (Number.isInteger(value) && value >= 0);
};

const isInt = (value) => {
    return Number.isInteger(value);
};

const isPositiveInt = (value) => {
    return Number.isInteger(value) && value > 0;
};

const isTimestamp = (value) => {
    const newTimestamp = new Date(value).getTime();
    return isNumeric(newTimestamp);
};

const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

module.exports = {isNonNegativeInteger, isInt, isPositiveInt, isTimestamp, isNumeric};