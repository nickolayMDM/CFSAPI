let timeHelpers = {
    getMonthForwardTimestamp: (startTimestamp) => {
        let date = new Date(startTimestamp);
        date.setMonth(date.getMonth() + 1);

        return date.getTime();
    }
};

module.exports = timeHelpers;