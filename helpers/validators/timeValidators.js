const isFutureTimestamp = (timestamp) => {
    const currentTimestamp = Date.now();
    return currentTimestamp < timestamp;
};

module.exports = {
    isFutureTimestamp
};